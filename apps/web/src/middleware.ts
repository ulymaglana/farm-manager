import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// NOTE: This middleware is a UX redirect only — NOT a security control.
// It checks whether a "token" cookie exists, but does NOT verify the JWT signature.
// Security is enforced by the API's requireAuth preHandler on every protected endpoint.
// A tampered or expired cookie that passes this check will be rejected by the API with 401.
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
