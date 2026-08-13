import fp from "fastify-plugin";
import type { FastifyPluginAsync } from "fastify";
import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";

const jwtPlugin: FastifyPluginAsync = async (app) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET environment variable is required. Generate one with: openssl rand -base64 32"
    );
  }
  await app.register(cookie);
  await app.register(jwt, {
    secret: process.env.JWT_SECRET,
    cookie: { cookieName: "token", signed: false },
  });
};

export const authPlugin = fp(jwtPlugin);
