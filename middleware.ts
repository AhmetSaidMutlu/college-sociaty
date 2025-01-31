/* eslint-disable @typescript-eslint/no-unused-vars */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'




// const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/forum(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth()
  const client = await clerkClient()

  const { pathname } = req.nextUrl
  const method = req.method
  // console.log('Pathname:', pathname);
  // console.log('Method:', method);

  if ((pathname === '/api/scholarship-status' && method === 'GET') ||
    (pathname === '/api/uploadogrbelge' && method === 'POST') ||
    (pathname === '/api/check-tc-kimlik-no' && method === 'POST') ||
    (pathname === '/api/scholarship-applications' && method === 'POST') ||
    (pathname === '/api/uploadnotort' && method === 'POST') ||
    (pathname === '/api/uploadburs' && method === 'POST') ||
    (pathname === '/api/uploadnufuz' && method === 'POST') ||
    (pathname === '/api/uploadogrbelge' && method === 'POST') ||
    (pathname === '/api/uploadtotal' && method === 'POST')
  ) {
    return
  }

  console.log('User ID:', userId);

  if (pathname.startsWith('/api') || pathname.startsWith('/admin')) {
    console.log('API or Admin Route');

    if (userId) {
      const user = await client.users.getUser(userId)
      const publicMetadata = user.publicMetadata
      const role = publicMetadata.role

      if (role === 'admin') {
        console.log('Admin User');
        return
      }
      else
        return NextResponse.redirect(new URL("/login", req.url));


      // console.log('User Public Metadata:', publicMetadata)
      return
    }
    else {
      console.log('Redirecting to Sign In');

      return redirectToSignIn()
    }
  }

})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
