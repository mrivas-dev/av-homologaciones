// Importing standard Deno modules
import { Application, Router } from "https://deno.land/x/oak@v17.1.6/mod.ts";
import { Client } from "https://deno.land/x/postgres@v0.19.5/mod.ts";
import { load } from "jsr:@std/dotenv@^0.225.0";

console.log("Loading environment variables...");
const env = await load();
console.log("Environment variables loaded");

const db = new Client({
  hostname: env.DB_HOST || "localhost",
  port: Number(env.DB_PORT) || 5432,
  user: env.DB_USER || "postgres",
  password: env.DB_PASSWORD || "",
  database: env.DB_NAME || "postgres",
});

let dbConnected = false;
try {
  // Set a timeout for database connection
  const connectPromise = db.connect();
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Connection timeout")), 5000)
  );

  await Promise.race([connectPromise, timeoutPromise]);
  dbConnected = true;
  console.log("✅ Database connected successfully");
} catch (error) {
  console.error("⚠️  Database connection failed:", (error as Error).message);
  console.log("Server will start without database connection");
}

const app = new Application();
const router = new Router();

// CORS middleware
app.use(async (ctx, next) => {
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

router.get("/api/hello", (ctx) => {
  ctx.response.body = { message: "Hello from Deno backend!" };
});

router.get("/api/messages", async (ctx) => {
  if (!dbConnected) {
    ctx.response.status = 503;
    ctx.response.body = { error: "Database not connected" };
    return;
  }

  try {
    const result = await db.queryObject<{ id: number; text: string }>(
      "SELECT * FROM messages",
    );
    ctx.response.body = result.rows;
  } catch (error) {
    console.error("Database error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

console.log("✅ Deno backend running on http://localhost:4000");
await app.listen({ port: 4000 });
