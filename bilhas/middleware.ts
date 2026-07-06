import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const realm = 'Basic realm="Bilhas Admin"';

function getAdminCredentials() {
  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? process.env.EDITOR_SECRET ?? process.env.SYNC_SECRET;

  return { password, username };
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    headers: { "WWW-Authenticate": realm },
    status: 401,
  });
}

function isAuthorized(request: NextRequest) {
  const { password, username } = getAdminCredentials();
  if (process.env.NODE_ENV !== "production" && !password) return true;
  if (!password) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Basic ")) return false;

  const encoded = header.slice("Basic ".length);
  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }
  const separator = decoded.indexOf(":");
  if (separator === -1) return false;

  const submittedUsername = decoded.slice(0, separator);
  const submittedPassword = decoded.slice(separator + 1);

  return submittedUsername === username && submittedPassword === password;
}

export function middleware(request: NextRequest) {
  if (!isAuthorized(request)) return unauthorized();

  if (request.nextUrl.pathname.startsWith("/redacao")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/redacao/:path*"],
};
