// Pass the current request pathname through to server components via a custom
// header. Server components can read it with headers().get("x-pathname") to
// know which URL the user is on — Next.js doesn't expose this otherwise.
//
// Used by requireSignedMnda() to preserve the user's destination across the
// signin/MNDA redirect chain so they land back on the page they were trying
// to reach instead of the homepage.
import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// Skip Next.js internals + static assets to keep the middleware cheap.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/.*).*)"],
};
