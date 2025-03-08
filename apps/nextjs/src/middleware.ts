import { NextRequest, NextResponse } from 'next/server'
import { ROUTE_NOT_FOUND } from '@/data/routes'

const unauthenticatedRoutes = []
const authenticatedRoutes = []

export async function middleware(req: NextRequest) {
  const url = req.nextUrl
  const path = url.pathname

  const admin = req.cookies.get('admin')?.value
  console.log(admin)

  if (admin !== 'alexpassalis9@gmail.com') {
    return NextResponse.redirect(new URL(ROUTE_NOT_FOUND, url))
  }

  // if (path === '/admin/auth') {
  // }

  // if (
  //   sessionCookie &&
  //   unauthenticatedRoutes.includes(
  //     route as (typeof unauthenticatedRoutes)[number]
  //   )
  // ) {
  //   return NextResponse.redirect(new URL(ROUTE_HOME, url))
  // }

  // if (
  //   !sessionCookie &&
  //   authenticatedRoutes.includes(route as (typeof authenticatedRoutes)[number])
  // ) {
  //   return NextResponse.redirect(new URL(ROUTE_LOGIN, url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
