import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req: any) => {
  const isPublic = req.nextUrl.pathname.startsWith("/login");

  if (isPublic) {
    return NextResponse.next();
  }

  if (!req.auth?.user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};