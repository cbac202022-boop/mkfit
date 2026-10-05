import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

// Première barrière de protection. Chaque page et action vérifie aussi la session côté serveur.
export default withAuth(
  function middleware(req) {
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    if (isAdminRoute && req.nextauth.token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => Boolean(token) },
    pages: { signIn: "/compte/connexion" },
  },
);

export const config = {
  matcher: ["/compte", "/compte/((?!connexion|inscription).*)", "/admin/:path*"],
};
