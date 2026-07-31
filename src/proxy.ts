import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server"

const isAdminAuthPage = createRouteMatcher(["/admin/auth"])
const isAdminRoute = createRouteMatcher(["/admin(.*)"])

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (!isAdminRoute(request)) {
    return
  }

  const isAuthenticated = await convexAuth.isAuthenticated()

  if (isAdminAuthPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/admin")
  }

  if (!isAdminAuthPage(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/admin/auth")
  }
})

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
}
