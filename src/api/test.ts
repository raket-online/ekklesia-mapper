// Simple test handler to verify Vercel function works
// Vercel expects Web API Request/Response format
export default async (req: Request) => {
  return new Response(
    JSON.stringify({
      status: 'ok',
      message: 'Test handler works',
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  )
}
