/*
 * Supabase browser client config.
 * Publishable key is safe to expose with RLS enabled; never add service_role or secret keys here.
 */
var TH_SUPABASE_URL = 'https://kmzbqllnyrkolnpahpwt.supabase.co'
var TH_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_EcmFPWcZeX5zBGvykAXUzw_5upOQL76'

if (!window.supabase || typeof window.supabase.createClient !== 'function') {
  throw new Error('Không tải được thư viện Supabase. Hãy kiểm tra mạng và tải lại trang.')
}

var thSupabase = window.supabase.createClient(
  TH_SUPABASE_URL,
  TH_SUPABASE_PUBLISHABLE_KEY,
  { auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true } }
)
