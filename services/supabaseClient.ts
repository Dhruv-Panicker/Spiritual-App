/**
 * Supabase client 
 * Auth sessions persist in AsyncStorage 
 */
import 'react-native-url-polyfill/auto';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/config/env';

// Fail soft if the build is missing its env config: createClient throws on an
// empty URL, which would crash the app before the first screen. With the
// placeholder the app opens and surfaces network errors instead.
if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.error(
    'Supabase env missing (SUPABASE_URL / SUPABASE_ANON_KEY) — check .env or EAS environment variables.'
  );
}

export const supabase = createClient(
  env.supabaseUrl || 'https://missing-supabase-url.invalid',
  env.supabaseAnonKey || 'missing-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Refresh auth tokens only while the app is foregrounded (Supabase's
// recommended React Native setup; timers don't fire reliably in background).
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
