import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname
    const roles = (token?.roles as string[]) || []

    // Public routes
    if (path === "/" || path === "/login" || path === "/403") {
      return NextResponse.next()
    }

    // Protect (app) routes
    if (path.startsWith("/dashboard") || path.startsWith("/queue")) {
      if (!roles.includes("x_swreq.it_support") && !roles.includes("x_swreq.admin")) {
        return NextResponse.rewrite(new URL("/403", req.url))
      }
    }

    if (path.startsWith("/approvals")) {
      if (!roles.includes("x_swreq.manager") && !roles.includes("x_swreq.it_manager") && !roles.includes("x_swreq.admin")) {
        return NextResponse.rewrite(new URL("/403", req.url))
      }
    }

    if (path.startsWith("/requests")) {
      if (!roles.includes("x_swreq.employee") && !roles.includes("x_swreq.admin")) {
        return NextResponse.rewrite(new URL("/403", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // If not logged in and not on public paths, return false to trigger login
        const path = req.nextUrl.pathname
        if (path === "/" || path === "/login" || path === "/403") return true
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
