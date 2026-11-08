'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loadCMS } from '@/lib/api';
import { DEFAULT_HABITS, DEFAULT_TEAM, DEFAULT_TEXTS, type Cms } from '@/lib/defaults';

type CmsCtx = {
    cms: Cms;
    ready: boolean;
    /** Ambil teks CMS (kosong sampai data selesai dimuat, sama seperti HTML asli) */
    T: (key: string) => string;
    reload: () => Promise<Cms>;
};

const Ctx = createContext<CmsCtx | null>(null);

export function CmsProvider({ children }: { children: React.ReactNode }) {
    const [cms, setCms] = useState<Cms>({ texts: DEFAULT_TEXTS, habits: DEFAULT_HABITS, team: DEFAULT_TEAM });
    const [ready, setReady] = useState(false);

    const reload = useCallback(async () => {
        const c = await loadCMS();
        setCms(c);
        setReady(true);
        return c;
    }, []);

    useEffect(() => { reload(); }, [reload]);

    const T = useCallback(
        (key: string) => (ready ? (cms.texts[key] != null ? cms.texts[key] : DEFAULT_TEXTS[key] || '') : ''),
        [cms, ready]
    );

    const value = useMemo(() => ({ cms, ready, T, reload }), [cms, ready, T, reload]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCms(): CmsCtx {
    const c = useContext(Ctx);
    if (!c) throw new Error('useCms harus dipakai di dalam <CmsProvider>');
    return c;
}

/* document.title = "<judul> 7 KAIH - <nama sekolah>" (sama seperti initPage di versi HTML) */
export function usePageTitle(titleKey: string = 'hero_title') {
    const { ready, T } = useCms();
    useEffect(() => {
        if (ready) document.title = `${T(titleKey)} 7 KAIH - ${T('school_name')}`;
    }, [ready, T, titleKey]);
}
