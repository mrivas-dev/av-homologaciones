declare global {
  namespace Deno {
    export const env: {
      get(key: string): string | undefined;
    };
  }

  // Deno.serve types
  interface DenoRequest {
    method: string;
    headers: Headers;
    formData(): Promise<FormData>;
    json(): Promise<any>;
  }

  interface DenoResponse {
    status?: number;
    headers?: Record<string, string>;
  }

  function serve(
    handler: (req: DenoRequest) => Response | Promise<Response>
  ): void;
}

export {};
