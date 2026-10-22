import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

const env = {} as { DB?: D1Database };

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. This Vercel deployment uses Supabase instead of D1."
    );
  }

  return drizzle(env.DB, { schema });
}
