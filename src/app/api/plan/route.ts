import { Interface, toBeHex } from 'ethers';
const V2 = new Interface(['function swapExactTokensForTokens(uint,uint,address[],address,uint)']);

function parseUnits(s: string, decimals: number): bigint {
  const [w, f=''] = s.split('.');
  if (s.split('.').length > 2) throw new Error('Invalid amount');
  if (f.length > decimals) throw new Error('Too many decimal places');
  const whole = BigInt(w||'0');
  const frac = BigInt((f + '0'.repeat(decimals - f.length)) || '0');
  return whole * (10n**BigInt(decimals)) + frac;
}

export async function POST(req: Request){
  const { intent, registry, addressBook, config } = await req.json();
  const resolveToken = (chain:any, sym:string) => registry?.[chain.family]?.[sym];
  const resolveTo = (k:string) => addressBook?.[k] ?? (k.startsWith('0x') || k.length>40 ? k : null);

  if (intent.type === 'price_prediction') return new Response(JSON.stringify({ ok:true, intent }), { headers:{ 'content-type':'application/json' } });

  if (intent.type === 'transfer') {
    const tok = resolveToken(intent.chain, intent.token);
    if (!tok) return new Response(JSON.stringify({ error:'Unknown token' }), { status:400 });
    const to = resolveTo(intent.to);
    if (!to) return new Response(JSON.stringify({ error:'Unknown recipient' }), { status:400 });

    if (intent.chain.family === 'evm') {
      const amount = parseUnits(intent.amount, tok.decimals);
      const tx:any = { chainId: intent.chain.chain_id, type:2 };
      if (tok.address) {
        const iface = new Interface(['function transfer(address to,uint256 amount)']);
        tx.to = tok.address;
        tx.data = iface.encodeFunctionData('transfer', [ to, toBeHex(amount) ]);
        tx.value = '0x0';
      } else {
        tx.to = to;
        tx.value = toBeHex(amount);
      }
      return new Response(JSON.stringify({ unsigned:{ payload:tx, preview:'EVM transfer' } }), { headers:{ 'content-type':'application/json' } });
    } else {
      return new Response(JSON.stringify({ plan:{ chain:'solana', to, token:tok, amount:intent.amount } }), { headers:{ 'content-type':'application/json' } });
    }
  }

  if (intent.type === 'swap') {
    const sell = resolveToken(intent.chain, intent.sell_token);
    const buy  = resolveToken(intent.chain, intent.buy_token);
    if (!sell || !buy) return new Response(JSON.stringify({ error:'Unknown sell/buy token' }), { status:400 });
    const slippageBps = intent.slippage_bps ?? 50;

    if (intent.chain.family === 'evm') {
      const amountIn = parseUnits(intent.amount, sell.decimals);
      const path = config?.evm?.path ?? [ sell.address, buy.address ];
      const q = await fetch(new URL('/api/evm/quote', req.url), { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ rpcUrl: config?.evm?.rpcUrl, router: config?.evm?.router, amountInWei: amountIn.toString(), path }) });
      if (!q.ok) return new Response(await q.text(), { status:q.status });
      const { amounts } = await q.json();
      const out = BigInt(amounts[amounts.length-1]);
      const minOut = out - (out * BigInt(slippageBps) / 10000n);
      const deadline = Math.floor(Date.now()/1000) + 600;
      const calldata = V2.encodeFunctionData('swapExactTokensForTokens', [ amountIn, minOut, path, config?.evm?.to, BigInt(deadline) ]);
      const tx = { chainId:intent.chain.chain_id, type:2, to: config?.evm?.router, data: calldata };
      return new Response(JSON.stringify({ quote:{ amountOut: out.toString(), minOut: minOut.toString(), slippageBps }, unsigned:{ payload: tx, preview: 'EVM swap' } }), { headers:{ 'content-type':'application/json' } });
    } else {
      const amountU64 = Number(parseUnits(intent.amount, sell.decimals));
      const qs = new URLSearchParams({ inputMint: sell.mint, outputMint: buy.mint, amount: String(amountU64), slippageBps:String(slippageBps) });
      const r = await fetch(new URL('/api/jupiter/quote?'+qs.toString(), req.url));
      if (!r.ok) return new Response(await r.text(), { status:r.status });
      const data = await r.json();
      const best = data.data?.[0];
      return new Response(JSON.stringify({ route: best }), { headers:{ 'content-type':'application/json' } });
    }
  }

  return new Response(JSON.stringify({ error:'Unsupported intent' }), { status:400 });
}
