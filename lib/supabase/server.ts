import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "@/lib/env";

// This server utility uses the publishable key with user cookies for SSR auth context.
// Do not add SUPABASE_SERVICE_ROLE_KEY here; privileged mutations must be isolated in audited server-only flows.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getPublicEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        }
      }
    }
  );
}
