import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "@/lib/env";

// Browser code may only use publishable Supabase values. Never import or expose service-role keys here.
export function createClient() {
  return createBrowserClient(
    getPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY")
  );
}
