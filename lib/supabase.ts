/* Koneksi Supabase. Jika .env.local belum diisi, situs tetap tampil memakai data bawaan (lib/defaults.ts). */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/* Interval ambil ulang data otomatis (milidetik). 15000 = 15 detik */
export const REFRESH_MS = 15000;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isConfigured: boolean = /^https?:\/\//.test(url) && key !== '' && !key.startsWith('ISI_');

export const sb: SupabaseClient | null = isConfigured ? createClient(url, key) : null;
