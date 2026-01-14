import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Jika user sudah login dan akses /login, redirect ke dashboard
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Jika user belum login dan akses protected route, redirect ke login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/master-data/:path*", "/login"],
};
