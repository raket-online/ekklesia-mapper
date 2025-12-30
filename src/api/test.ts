// Simple test handler to verify Vercel function works
export default async (req: any, res: any) => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'ok',
      message: 'Test handler works',
      timestamp: new Date().toISOString()
    })
  }
}
