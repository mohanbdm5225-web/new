import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    "/login",
    "/favicon.ico",
  ];

  const isPublicPath =
    publicPaths.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/public");

  if (isPublicPath) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("geo_pm_auth")?.value;
  const authSecret = process.env.AUTH_SECRET;

  if (!authSecret || authCookie !== authSecret) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};