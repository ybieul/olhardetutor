import { createClient } from '@supabase/supabase-js';

import { env } from '@/config/env';

import type { Database } from './types';

/**
 * The only Supabase client instance in the app. Every query must go
 * through this file so table access stays centrally typed — see
 * CLAUDE.md, "Toda query ao Supabase passa por src/lib/supabase/".
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey);
