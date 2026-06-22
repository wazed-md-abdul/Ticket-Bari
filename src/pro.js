import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from './lib/auth'

// Role → allowed dashboard prefix
const ROLE_DASHBOARD = {
  admin: '/dashboard/admin',
  vendor: '/dashboard/vendor',
  user: '/dashboard/user',
}

export async function proxy(request) {
  const { pathname } = request.nextUrl

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // লগিন নেই → signin এ পাঠাও
  if (!session?.user) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(signInUrl)
  }


  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path+',
  ],
}
