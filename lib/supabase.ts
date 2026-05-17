import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY ?? 'placeholder'

// Public client — uses anon key, respects RLS
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server client — uses service key, bypasses RLS (server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Fetch all memory_profile as flat object
export async function getMemory(): Promise<Record<string, string>> {
  const { data, error } = await supabase
    .from('memory_profile')
    .select('key, value')

  if (error || !data) return {}

  return Object.fromEntries(
    data.map((row) => [row.key, row.value ?? ''])
  )
}
