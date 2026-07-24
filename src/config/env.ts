/**
 * Validated environment variables. Every env var the app needs is declared
 * here and checked at startup — if one is missing, the app fails fast with
 * a clear message instead of breaking later with a cryptic error.
 *
 * Never read `import.meta.env` anywhere else in the codebase.
 */

type RequiredEnvVar = {
  key: keyof ImportMetaEnv;
  description: string;
};

const REQUIRED_ENV_VARS: RequiredEnvVar[] = [
  {
    key: 'VITE_SUPABASE_URL',
    description: 'Supabase project URL (Project Settings > API > Project URL)',
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous/public API key (Project Settings > API > anon public)',
  },
];

function readEnv(): { supabaseUrl: string; supabaseAnonKey: string } {
  const missing: string[] = [];

  for (const { key, description } of REQUIRED_ENV_VARS) {
    if (!import.meta.env[key]) {
      missing.push(`  - ${key}: ${description}`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      [
        'Missing required environment variable(s):',
        ...missing,
        '',
        'Copy .env.example to .env.local and fill in the missing values.',
      ].join('\n'),
    );
  }

  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };
}

export const env = {
  ...readEnv(),
  mode: import.meta.env.MODE,
  isProduction: import.meta.env.PROD,
  isDevelopment: import.meta.env.DEV,
  vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY ?? null,
} as const;
