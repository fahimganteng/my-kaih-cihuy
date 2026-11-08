'use client';

import { useState } from 'react';
import { useCms, usePageTitle } from '@/components/CmsProvider';

const PLACEHOLDER_CLS = 'w-28 h-28 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 text-sm font-semibold';

function TeamPhoto({ url, name }: { url: string; name: string }) {
    const [failed, setFailed] = useState(false);
    if (!url || failed) return <div className={PLACEHOLDER_CLS}>Foto</div>;
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={url}
            alt={name}
            className="w-28 h-28 rounded-full object-cover border-2 border-dashed border-white ring-2 ring-slate-300"
            onError={() => setFailed(true)}
        />
    );
}

/* Laman Tentang: kartu tim dari tabel team_members */
export default function TentangPage() {
    const { cms, T } = useCms();
    usePageTitle('tentang_title');

    return (
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <section className="space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 card-shadow border border-slate-100">
                    <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                        <i className="fa-solid fa-users text-smala-600"></i> <span>{T('tentang_title')}</span>
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{T('tentang_intro')}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cms.team.map((m, i) => (
                        <div key={m.id ?? i} className="bg-white rounded-2xl p-6 card-shadow border border-slate-100 flex flex-col items-center text-center hover:border-emerald-200 transition">
                            <TeamPhoto url={m.photo_url} name={m.name} />
                            <h4 className="font-bold text-slate-900 text-sm mt-4">{m.name}</h4>
                            <p className="text-xs text-slate-500 mt-1">{m.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
