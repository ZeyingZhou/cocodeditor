import { createClient } from '@supabase/supabase-js';

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_KEY!;

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);