export type UserRole = "USER" | "ADMIN";

// JWT payload — only non-PII identifiers travel in the token
export interface JwtPayload {
  sub: string; // user ID
  role: UserRole;
}

// Public user shape — safe to send to clients, never includes passwordHash
export interface UserPublic {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Legacy alias kept for compatibility
export type User = UserPublic;

export interface CreateUserInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
