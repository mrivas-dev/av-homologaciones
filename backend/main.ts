// Import dependencies from deps.ts
import { Application, Router } from "./deps.ts";

const app = new Application();
const router = new Router();

// CORS middleware
app.use(async (ctx: any, next: () => Promise<void>) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  ctx.response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 204; // No Content
    return;
  }

  await next();
});

// Simple API endpoint
router.get("/api/hello", (ctx: any) => {
  ctx.response.body = { message: "Hello from Deno backend!" };
});

// Mock messages endpoint that doesn't require a database
router.get("/api/messages", (ctx: any) => {
  ctx.response.body = [
    { id: 1, text: "This is a test message" },
    { id: 2, text: "No database required" }
  ];
});

// Error handling middleware
app.use(async (ctx: any, next: () => Promise<void>) => {
  try {
    await next();
  } catch (err) {
    console.error("Error:", err);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("✅ Deno backend running on http://localhost:4000");
await app.listen({ port: 4000 });
