import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { auth } from './lib/auth'

export async function proxy(request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session?.user) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/auth/signin', request.url))
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tickets/:id",
  ],
}
