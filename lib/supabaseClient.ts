import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qqbutzijqjigttddfvdn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxYnV0emlqcWppZ3R0ZGRmdmRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1OTEzMzgsImV4cCI6MjA4MDE2NzMzOH0.YCELW7gXHe5Hy3esz0R6eG-OMqv0Z_83NfhTUKpJS3U";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);