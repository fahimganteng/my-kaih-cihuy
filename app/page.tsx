'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCms, usePageTitle } from '@/components/CmsProvider';
import DiagramSection from '@/components/DiagramSection';
import { HABIT_COLORS } from '@/lib/utils';

export default function BerandaPage() {
    const { cms, T } = useCms();
    usePageTitle();

    useEffect(() => {
        if (window.location.hash === '#diagram') {
            const id = setTimeout(() => document.getElementById('diagram')?.scrollIntoView({ behavior: 'smooth' }), 150);
            return () => clearTimeout(id);
        }
    }, []);

    return (
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <section className="space-y-8">

                {/* Hero */}
                <div className="gradient-banner text-white rounded-2xl p-6 sm:p-10 card-shadow relative overflow-hidden">
                    <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-emerald-300 mb-4 border border-white/10">
                            <i className="fa-solid fa-award"></i> <span>{T('hero_badge')}</span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">{T('hero_title')}</h2>
                        <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed">{T('hero_text')}</p>

                        <div className="mt-6 flex flex-wrap gap-4">
                            <Link href="/murid" className="px-6 py-3 bg-smala-600 hover:bg-smala-500 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-900/40 transition transform active:scale-95 flex items-center gap-2">
                                <i className="fa-solid fa-user-graduate"></i> <span>{T('menu_murid')}</span> (Isi Jurnal KAIH)
                            </Link>
                            <Link href="/admin" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl backdrop-blur-md border border-white/20 transition transform active:scale-95 flex items-center gap-2">
                                <i className="fa-solid fa-lock"></i> <span>{T('menu_admin')}</span> (Spreadsheet)
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Penjelasan 7 KAIH */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 card-shadow border border-slate-100">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <i className="fa-solid fa-book-bookmark text-smala-600"></i> <span>{T('habits_title')}</span>
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-500 mt-1">{T('habits_intro')}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {cms.habits.map((h, i) => {
                            const c = HABIT_COLORS[i % HABIT_COLORS.length];
                            return (
                                <div key={h.id ?? i} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition">
                                    <div className={`w-10 h-10 rounded-lg ${c.bg} ${c.text} flex items-center justify-center font-bold mb-3`}>
                                        <i className={`fa-solid ${h.icon}`}></i>
                                    </div>
                                    <h4 className="font-bold text-slate-900 text-sm">{i + 1}. {h.name}</h4>
                                    <p className="text-xs text-slate-500 mt-1">{h.description || ''}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Diagram */}
                <div>
                    <DiagramSection />
                </div>
            </section>
        </main>
    );
}
