
import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // ✅ Logging (من الملف الأول)
  console.log(`[${req.method}] ${req.nextUrl.pathname}`);

  // ✅ Clerk Auth Check (من الملف الثاني)
  const publicPaths = [
    '/',
    '/sign-in',
    '/sign-up',
    '/api/webhooks/clerk',
    '/api/search',
    '/search',
    '/pharmacies',
    '/invite',
  ];

  const pathname = req.nextUrl.pathname;

  const isPublic =
    // pathname === '/' ||
    publicPaths.some((path) => pathname.startsWith(path));

  if (!isPublic) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}