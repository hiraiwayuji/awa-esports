import { NextRequest, NextResponse } from "next/server";

// /admin/* と /api/admin/* に Basic 認証を強制する。
// 認証情報は Vercel env: ADMIN_USER / ADMIN_PASSWORD。

export function middleware(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const user = process.env.ADMIN_USER;
  const pass = process.env.ADMIN_PASSWORD;

  if (!user || !pass) {
    return new NextResponse("Admin not configured", { status: 503 });
  }

  // btoa は Edge runtime で利用可能
  const expected = "Basic " + btoa(`${user}:${pass}`);

  if (!auth || auth !== expected) {
    return new NextResponse("Unauthorized", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="AWAKEN GLOW Admin", charset="UTF-8"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
