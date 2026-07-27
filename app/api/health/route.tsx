//app/api/health/route.tsx
export async function GET() {
  return Response.json({ 
    status:"ok",
    timestamp:new Date().toISOString() 
  });
}