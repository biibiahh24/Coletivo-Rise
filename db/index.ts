import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type D1Binding = Parameters<typeof drizzle>[0];
const env = {} as { DB?: D1Binding };

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. This Vercel deployment uses Supabase instead of D1."
    );
  }

  return drizzle(env.DB, { schema });
}
