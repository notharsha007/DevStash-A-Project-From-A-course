import NextAuth from "next-auth"
import authConfig from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard")

  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL("/api/auth/signin", nextUrl))
  }
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
