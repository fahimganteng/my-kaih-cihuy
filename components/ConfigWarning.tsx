'use client';

import { useCms } from './CmsProvider';
import { isConfigured } from '@/lib/supabase';

/* Banner jika Supabase belum diisi */
export default function ConfigWarning() {
    const { ready } = useCms();
    if (!ready || isConfigured) return null;
    return (
        <div className="bg-amber-100 text-amber-900 text-xs sm:text-sm font-semibold text-center px-4 py-2 border-b border-amber-200">
            <i className="fa-solid fa-triangle-exclamation"></i> Supabase belum terhubung. Isi <code>.env.local</code> (NEXT_PUBLIC_SUPABASE_URL &amp; NEXT_PUBLIC_SUPABASE_ANON_KEY) lalu jalankan ulang <code>npm run dev</code>. Saat ini memakai data bawaan.
        </div>
    );
}
