const requiredPublicEnv = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] as const;

export type PublicEnvKey = (typeof requiredPublicEnv)[number];

export function getPublicEnv(key: PublicEnvKey): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}
