import { JsonRpcProvider, Interface } from 'ethers';
const IRouter = new Interface([ 'function getAmountsOut(uint amountIn, address[] path) view returns (uint[])' ]);

export async function POST(req: Request){
  const { rpcUrl, router, amountInWei, path } = await req.json();
  const provider = new JsonRpcProvider(rpcUrl);
  const data = IRouter.encodeFunctionData('getAmountsOut', [ BigInt(amountInWei), path ]);
  const out = await provider.call({ to: router, data });
  const [amounts] = IRouter.decodeFunctionResult('getAmountsOut', out);
  return new Response(JSON.stringify({ amounts: amounts.map((x:any)=>x.toString()) }), { headers:{ 'content-type':'application/json' } });
}
