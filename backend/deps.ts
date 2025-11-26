// Standard library
export { load } from "jsr:@std/dotenv@^0.225.0";

// Third-party dependencies
export { Application, Router } from "https://deno.land/x/oak@v17.1.6/mod.ts";
export { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

type Message = {
  id?: string;
  created_at?: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
};

export type { Message };
