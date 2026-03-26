import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qmzarchutpoehcoanfal.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtemFyY2h1dHBvZWhjb2FuZmFsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MDg3MTcsImV4cCI6MjA5MDA4NDcxN30.AVS5bv1M3YGTT10kaOpoKfxOvMOFr4r2u564LsSmQrg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
