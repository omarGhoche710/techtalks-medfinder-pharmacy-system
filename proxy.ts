import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, req) => {
  const publicPaths = [
    '/sign-in',
    '/sign-up',
    '/api/webhooks/clerk',
    '/search',
    '/pharmacies',
    '/invite',
  ];

  const pathname = req.nextUrl.pathname;
  
  const isPublic = 
    pathname === '/' ||
    publicPaths.some((path) => pathname.startsWith(path));

  if (!isPublic) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}