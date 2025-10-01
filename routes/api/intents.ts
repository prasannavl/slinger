import { Handlers } from "$fresh/server.ts";
import { getPriceSummary, getPriceSignal, prepareSwap } from "../../lib/intents.ts";
import { SupportedCoin } from "../../lib/types.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const body = await req.json();
      const { type, params } = body;

      let data = null;

      switch (type) {
        case "price_summary":
          data = await getPriceSummary();
          break;
        case "price_signal":
          if (params?.coin) {
            data = await getPriceSignal(params.coin as SupportedCoin);
          }
          break;
        case "swap":
          if (params?.fromCoin && params?.toCoin && params?.amount) {
            data = prepareSwap(
              params.fromCoin as SupportedCoin,
              params.toCoin as SupportedCoin,
              params.amount as number,
              params.slippage || 0.5
            );
          }
          break;
      }

      return new Response(JSON.stringify({ data }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          error: error instanceof Error ? error.message : "Unknown error" 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
};
