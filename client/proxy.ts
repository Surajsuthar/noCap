import { NextResponse, type NextRequest } from "next/server";

export default function proxy(req: NextRequest) {
  return NextResponse.next();
}

export const authRoute = ["/auth"];
export const protectedRoute = ["/chat"];

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
