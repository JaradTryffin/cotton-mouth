import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This middleware enforces authentication for protected routes
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = ["/login", "/"].includes(path);

  // Check if trying to access a protected route (dashboard)
  const isProtectedDashboardRoute = path.startsWith("/dashboard");

  // Redirect rules
  if (!isAuthenticated && isProtectedDashboardRoute) {
    // Redirect to login if trying to access dashboard while not authenticated
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && path === "/login") {
    // Redirect to dashboard if already authenticated and trying to access login
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Configure middleware to only run on login and dashboard routes
export const config = {
  matcher: ["/login", "/dashboard/:path*"],
};
