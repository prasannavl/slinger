// Server-side utilities and API endpoints if needed
// Most API calls are handled client-side as per requirements

import { Application, Router, Context } from "https://deno.land/x/oak@v12.6.1/mod.ts";

const router = new Router();

// Health check endpoint
router.get("/api/health", (context: Context) => {
  context.response.body = { status: "ok" };
});

export function createServer() {
  const app = new Application();

  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

// Can be used for server-side processing if needed
export async function startServer(port: number = 8000) {
  const app = createServer();
  console.log(`Server running on http://localhost:${port}`);
  await app.listen({ port });
}
