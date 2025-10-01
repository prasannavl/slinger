export async function POST(req: Request){
  const body = await req.text();
  const r = await fetch('https://quote-api.jup.ag/v6/swap', { method:'POST', headers:{ 'content-type':'application/json' }, body });
  return new Response(r.body, { status:r.status, headers:{ 'content-type':'application/json' } });
}
