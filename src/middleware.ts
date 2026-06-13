import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth routes to pass through
  if (
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/signup") ||
    pathname.startsWith("/api/auth/logout")
  ) {
    return NextResponse.next();
  }

  // Intercept and protect all other API routes
  if (pathname.startsWith("/api/")) {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        return NextResponse.json({ success: false, error: "Malformed session token" }, { status: 401 });
      }
      
      // Base64 decode JWT payload (safe for Next.js Edge runtime)
      const payload = JSON.parse(atob(parts[1]));

      if (!payload.userId || !payload.role) {
        return NextResponse.json({ success: false, error: "Invalid session payload" }, { status: 401 });
      }

      // Inject authorization headers to the request
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", payload.userId);
      requestHeaders.set("x-user-role", payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid or expired session token" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
