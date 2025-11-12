// Module declarations for Deno Edge Function imports
/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'https://deno.land/std@0.168.0/http/server.ts' {
  export function serve(
    handler: (req: DenoRequest) => Response | Promise<Response>
  ): void;
}

declare module 'https://esm.sh/@supabase/supabase-js@2' {
  export interface SupabaseClient {
    storage: {
      from(bucket: string): {
        upload(path: string, file: File, options?: { contentType?: string; upsert?: boolean }): Promise<{ data?: any; error?: any }>;
        getPublicUrl(path: string): { data: { publicUrl: string } };
      };
    };
    from(table: string): {
      insert(data: Record<string, unknown>): Promise<{ data?: any; error?: any }>;
      select(columns?: string): {
        single(): Promise<{ data?: any; error?: any }>;
      };
      eq(column: string, value: unknown): {
        single(): Promise<{ data?: any; error?: any }>;
        update(data: Record<string, unknown>): Promise<{ data?: any; error?: any }>;
      };
    };
  }

  export function createClient(
    url: string,
    key: string,
    options?: {
      global?: {
        headers?: Record<string, string>;
      };
    }
  ): SupabaseClient;
}

declare module 'https://esm.sh/mercadopago@2.0.8' {
  export class MercadoPagoConfig {
    constructor(options: { accessToken: string });
  }

  export class Preference {
    static create(client: MercadoPagoConfig, data: any): Promise<any>;
  }

  export class Payment {
    static get(client: MercadoPagoConfig, id: string): Promise<any>;
  }
}

export {};
