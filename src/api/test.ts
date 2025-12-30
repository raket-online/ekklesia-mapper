// Edge runtime test handler - uses Web API Request/Response
export default async function handler(request: Request) {
  return new Response(JSON.stringify({
    status: 'ok',
    runtime: 'edge',
    url: request.url
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
