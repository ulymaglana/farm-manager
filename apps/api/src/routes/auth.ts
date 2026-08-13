import type { FastifyInstance, RouteShorthandOptions } from "fastify";
import { hash, verify } from "argon2";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth } from "../hooks/requireAuth.js";
import type { UserPublic, UserRole, JwtPayload } from "@myapp/shared";
import crypto from "node:crypto";

const ARGON2_OPTIONS = {
  type: 2 as const, // Argon2id
  memoryCost: 65536, // 64 MiB — OWASP 2024 recommendation
  timeCost: 3,
  parallelism: 1,
};

// Pre-computed dummy hash for timing-safe login (prevents user enumeration via response time)
const DUMMY_HASH = await hash("dummy_password_for_timing_safety", ARGON2_OPTIONS);

const RegisterBody = z.object({
  email: z.string().email().max(255),
  password: z.string().min(12, "Password must be at least 12 characters").max(128),
  name: z.string().max(100).optional(),
});

const LoginBody = z.object({
  email: z.string().email(),
  password: z.string(),
});

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const JWT_EXPIRY = "15m";

function toUserPublic(user: {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}): UserPublic {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

function setAuthCookies(
  app: FastifyInstance,
  reply: import("fastify").FastifyReply,
  userId: string,
  role: UserRole,
  refreshToken: string
): string {
  const payload: JwtPayload = { sub: userId, role };
  const token = app.jwt.sign(payload, { expiresIn: JWT_EXPIRY });
  const isProd = process.env.NODE_ENV === "production";
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    path: "/",
  };
  reply.setCookie("token", token, cookieOpts);
  reply.setCookie("refreshToken", refreshToken, {
    ...cookieOpts,
    maxAge: REFRESH_TOKEN_TTL_MS / 1000,
  });
  return token;
}

const protectedOpts = {
  preHandler: [requireAuth],
} satisfies RouteShorthandOptions;

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // POST /auth/register
  app.post("/register", async (request, reply) => {
    const result = RegisterBody.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: result.error.issues[0]?.message ?? "Invalid input" });
    }
    const { email, password, name } = result.data;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return reply.status(409).send({ error: "Email already registered" });
    }

    const passwordHash = await hash(password, ARGON2_OPTIONS);
    const user = await prisma.user.create({
      data: { email, name: name ?? null, passwordHash },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const refreshToken = generateRefreshToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    const token = setAuthCookies(app, reply, user.id, user.role as UserRole, refreshToken);
    return reply.status(201).send({ user: toUserPublic(user), token });
  });

  // POST /auth/login
  app.post("/login", async (request, reply) => {
    const result = LoginBody.safeParse(request.body);
    if (!result.success) {
      return reply.status(400).send({ error: "Invalid input" });
    }
    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        failedLoginCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      // Timing-safe: verify against dummy hash so response time matches a real user
      await verify(DUMMY_HASH, password);
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    // Progressive delay for accounts with repeated failures
    if (user.failedLoginCount >= 5) {
      const delayMs = Math.min(1000 * Math.pow(2, user.failedLoginCount - 5), 30000);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const valid = await verify(user.passwordHash, password);
    if (!valid) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: { increment: 1 },
          lastFailedLoginAt: new Date(),
        },
      });
      return reply.status(401).send({ error: "Invalid credentials" });
    }

    // Reset failure counter on success
    if (user.failedLoginCount > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginCount: 0, lastFailedLoginAt: null },
      });
    }

    const refreshToken = generateRefreshToken();
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    const token = setAuthCookies(app, reply, user.id, user.role as UserRole, refreshToken);
    return reply.send({ user: toUserPublic(user), token });
  });

  // POST /auth/refresh
  app.post("/refresh", async (request, reply) => {
    const refreshToken = (request.cookies as Record<string, string | undefined>)["refreshToken"];
    if (!refreshToken) {
      return reply.status(401).send({ error: "No refresh token" });
    }

    const session = await prisma.session.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return reply.status(401).send({ error: "Invalid or expired refresh token" });
    }

    // Rotate: delete old session, create new one
    await prisma.session.delete({ where: { id: session.id } });
    const newRefreshToken = generateRefreshToken();
    await prisma.session.create({
      data: {
        userId: session.user.id,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    const token = setAuthCookies(app, reply, session.user.id, session.user.role as UserRole, newRefreshToken);
    return reply.send({ user: toUserPublic(session.user), token });
  });

  // GET /auth/me
  app.get("/me", protectedOpts, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      return reply.status(404).send({ error: "User not found" });
    }
    return reply.send({ user: toUserPublic(user) });
  });

  // POST /auth/logout
  app.post("/logout", protectedOpts, async (request, reply) => {
    const refreshToken = (request.cookies as Record<string, string | undefined>)["refreshToken"];
    if (refreshToken) {
      await prisma.session.deleteMany({ where: { token: refreshToken } });
    }
    const cookieOpts = {
      httpOnly: true,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };
    reply.clearCookie("token", cookieOpts);
    reply.clearCookie("refreshToken", cookieOpts);
    return reply.send({ message: "Logged out" });
  });
}
