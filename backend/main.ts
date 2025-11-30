// Import dependencies from deps.ts
import { Application, Router } from "./deps.ts";
import { initializeDatabase } from "./config/db.ts";

// Import routes
import authRoutes from "./routes/auth.routes.ts";
import homologationRoutes from "./routes/homologation.routes.ts";
import photoRoutes from "./routes/photo.routes.ts";
import paymentRoutes from "./routes/payment.routes.ts";
import adminRoutes from "./routes/admin.routes.ts";

// Initialize application
const app = new Application();

// Initialize database connection
let isDatabaseConnected = false;
try {
  await initializeDatabase();
  isDatabaseConnected = true;
  console.log("✅ Database connection established successfully");
} catch (error) {
  console.error("❌ Failed to connect to database:", error);
  console.log("⚠️  Starting server without database connection");
}

// Request logging middleware
app.use(async (ctx: any, next: () => Promise<void>) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.request.method} ${ctx.request.url.pathname} - ${ms}ms`);
});

// CORS middleware
app.use(async (ctx: any, next: () => Promise<void>) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
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

// Error handling middleware
app.use(async (ctx: any, next: () => Promise<void>) => {
  try {
    await next();
  } catch (err) {
    console.error("Error:", err);
    ctx.response.status = err.status || 500;
    ctx.response.body = {
      error: err.message || "Internal server error",
    };
  }
});

// Health check endpoint
const healthRouter = new Router();
healthRouter.get("/api/health", (ctx: any) => {
  ctx.response.body = {
    status: "ok",
    database: isDatabaseConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  };
});

// Register all routes
app.use(healthRouter.routes());
app.use(healthRouter.allowedMethods());

app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

app.use(homologationRoutes.routes());
app.use(homologationRoutes.allowedMethods());

app.use(photoRoutes.routes());
app.use(photoRoutes.allowedMethods());

app.use(paymentRoutes.routes());
app.use(paymentRoutes.allowedMethods());

app.use(adminRoutes.routes());
app.use(adminRoutes.allowedMethods());

const PORT = parseInt(Deno.env.get("PORT") || "4000");

console.log("✅ Deno backend running on http://localhost:" + PORT);
console.log("📚 API Documentation:");
console.log("  - Health: GET /api/health");
console.log("  - Auth: POST /api/auth/login, /api/auth/register");
console.log("  - Homologations: /api/homologations");
console.log("  - Photos: /api/photos");
console.log("  - Payments: /api/payments");
console.log("  - Admin: /api/admin/homologations");

await app.listen({ port: PORT });
