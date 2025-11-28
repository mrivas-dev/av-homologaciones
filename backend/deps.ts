// Standard library
export { load } from "jsr:@std/dotenv@^0.225.0";

// Third-party dependencies
export { Application, Router } from "https://deno.land/x/oak@v17.1.6/mod.ts";
export type {
  Context,
  Middleware,
} from "https://deno.land/x/oak@v17.1.6/mod.ts";
export { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

// Authentication
export * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
export {
  create as createJWT,
  verify as verifyJWT,
} from "https://deno.land/x/djwt@v3.0.2/mod.ts";
export type { Payload } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

// File upload
export { multiParser } from "https://deno.land/x/multiparser@0.114.0/mod.ts";

// Validation
export { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

type Message = {
  id?: string;
  created_at?: string;
  payload: Record<string, unknown>;
  status: "pending" | "processing" | "completed" | "failed";
};

export type { Message };
