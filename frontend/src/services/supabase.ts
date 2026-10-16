import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes("placeholder")
);

// Production redirect base
export const getRedirectUrl = (path: string = "") => {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://cropguard-ochre.vercel.app";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${cleanPath}`;
};

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: "cropguard_supabase_session",
      },
    })
  : null;

/**
 * Verifies live connection to Supabase Auth & API services.
 */
export const verifySupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: "Supabase client is not configured. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.",
    };
  }

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return {
        success: false,
        message: `Supabase auth connection check returned error: ${error.message}`,
        details: error,
      };
    }
    return {
      success: true,
      message: "Supabase connection verified successfully.",
      details: {
        url: supabaseUrl,
        sessionActive: Boolean(data.session),
      },
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Supabase connection failed: ${err?.message || String(err)}`,
      details: err,
    };
  }
};
