import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * This is the new replacement for middleware.ts in Next.js 16
 * It must export a function named "proxy" OR default export
 */

export function proxy(request: NextRequest) {
  // For now, just pass all requests through
  return NextResponse.next();
}

/**
 * Optional matcher (applies to all routes except static)
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};