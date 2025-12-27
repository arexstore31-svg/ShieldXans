import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Script {
  id: string;
  name: string;
  description: string;
  original_script: string;
  obfuscated_script: string;
  created_at: string;
  updated_at: string;
}

export interface ScriptKey {
  id: string;
  script_id: string;
  key_value: string;
  hwid: string | null;
  expires_at: string;
  max_activations: number;
  current_activations: number;
  is_active: boolean;
  created_at: string;
}
