import { Handlers } from "$fresh/server.ts";
import { classifyIntent } from "../../lib/ai.ts";

export const handler: Handlers = {
  async POST(req) {
    try {
      const { input } = await req.json();
      const intent = await classifyIntent(input);
      
      return new Response(JSON.stringify(intent), {
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
