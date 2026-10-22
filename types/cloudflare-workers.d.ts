interface Env {
  DB?: D1Database;
  BUCKET?: R2Bucket;
}

declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    [key: string]: unknown;
  };
}
