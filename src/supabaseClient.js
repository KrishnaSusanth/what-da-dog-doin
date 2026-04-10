import { createClient } from '@supabase/supabase-js'

// These are your environment variables (The IDs for your specific DB)
const supabaseUrl = 'https://mzjqpmkbucrosaiiuqxc.supabase.co'
const supabaseAnonKey = 'sb_publishable_BrUzeqdn3Gm7LBje2LeJ9A_DqBFW91J'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)