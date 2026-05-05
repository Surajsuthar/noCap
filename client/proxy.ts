import { type NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_COOKIE = "nocap_access_token";
const REFRESH_TOKEN_COOKIE = "nocap_refresh_token";

export const authRoute = ["/auth", "/"];
export const protectedRoute = ["/chat"];

function isRouteMatch(pathname: string, routes: string[]) {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

function hasAuthSession(req: NextRequest) {
  return (
    req.cookies.has(ACCESS_TOKEN_COOKIE) ||
    req.cookies.has(REFRESH_TOKEN_COOKIE)
  );
}

export default function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthRoute = isRouteMatch(pathname, authRoute);
  const isProtectedRoute = isRouteMatch(pathname, protectedRoute);
  const isAuthenticated = hasAuthSession(req);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/chat", req.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/auth", req.url);
    loginUrl.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
