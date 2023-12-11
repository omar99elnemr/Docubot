import { authMiddleware } from '@kinde-oss/kinde-auth-nextjs/server'

export const config = {
  matcher: ['/dashboard/:path*',
              '/auth-callback',
              "/((?!api|_next/static|_next/image|images|favicon.ico).*)"
            ],
}

export default authMiddleware
