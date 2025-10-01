const MODEL = 'gpt-4o-mini';

export async function POST(req: Request) {
  const { text, defaults } = await req.json();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error:'OPENAI_API_KEY missing' }), { status:500 });

  const tools = [{
    type:'function',
    function:{
      name:'create_intent',
      description:'Wallet intent',
      parameters:{
        type:'object',
        oneOf:[
          {'$ref':'#/definitions/TransferIntent'},
          {'$ref':'#/definitions/SwapIntent'},
          {'$ref':'#/definitions/PricePrediction'}
        ],
        definitions:{
          Chain:{ type:'object', oneOf:[
            { type:'object', properties:{ family:{const:'evm'}, chain_id:{type:'integer'} }, required:['family','chain_id'] },
            { type:'object', properties:{ family:{const:'solana'} }, required:['family'] }
          ]},
          TransferIntent:{ type:'object', properties:{ type:{const:'transfer'}, chain:{'$ref':'#/definitions/Chain'}, token:{type:'string'}, amount:{type:'string'}, to:{type:'string'}, memo:{type:['string','null']} }, required:['type','chain','token','amount','to'] },
          SwapIntent:{ type:'object', properties:{ type:{const:'swap'}, chain:{'$ref':'#/definitions/Chain'}, sell_token:{type:'string'}, buy_token:{type:'string'}, amount:{type:'string'}, slippage_bps:{type:'integer','minimum':1,'maximum':300} }, required:['type','chain','sell_token','buy_token','amount'] },
          PricePrediction:{ type:'object', properties:{ type:{const:'price_prediction'}, tokens:{type:'array',items:{type:'string'}}, horizon_days:{type:'integer','minimum':1,'maximum':365} }, required:['type','tokens'] }
        }
      }
    }
  }];

  const sys = 'You are a crypto wallet intent parser. Return exactly one tool call.';
  const user = `Text: ${text}\nSupported: ${JSON.stringify(defaults??{},null,2)}`;

  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method:'POST',
    headers:{ 'authorization':`Bearer ${apiKey}`, 'content-type':'application/json' },
    body: JSON.stringify({ model: MODEL, messages:[{role:'system',content:sys},{role:'user',content:user}], tools, tool_choice:{ type:'function', function:{ name:'create_intent' } } })
  });
  if (!r.ok) return new Response(await r.text(), { status:r.status });
  const data = await r.json();
  const tool = data.choices?.[0]?.message?.tool_calls?.[0];
  if (!tool) return new Response(JSON.stringify({ error:'No tool call' }), { status:500 });
  return new Response(JSON.stringify({ intent: JSON.parse(tool.function.arguments) }), { headers:{ 'content-type':'application/json' } });
}
