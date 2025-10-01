export async function GET(req: Request){
  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const r = await fetch('https://quote-api.jup.ag/v6/quote?'+qs);
  return new Response(r.body, { status:r.status, headers:{ 'content-type':'application/json' } });
}
