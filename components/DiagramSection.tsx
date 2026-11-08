'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { useCms } from './CmsProvider';
import { fetchPublicScores } from '@/lib/api';
import { computeStats } from '@/lib/stats';
import { isConfigured, REFRESH_MS } from '@/lib/supabase';
import type { ScoreRow } from '@/lib/defaults';

Chart.register(...registerables);

const f2 = (v: number) => (Number(v) || 0).toFixed(2);

/* Diagram & statistik (dipakai di Beranda dan Laman Admin).
   refreshSignal: naikkan angkanya untuk memaksa ambil ulang data sekarang juga. */
export default function DiagramSection({ refreshSignal = 0 }: { refreshSignal?: number }) {
    const { cms, T } = useCms();
    const habits = cms.habits;

    const [rows, setRows] = useState<ScoreRow[]>([]);
    const [sync, setSync] = useState<{ ok: boolean; msg: string }>({ ok: true, msg: 'Menyambung...' });

    const pieRef = useRef<HTMLCanvasElement>(null);
    const barRef = useRef<HTMLCanvasElement>(null);

    const stats = useMemo(() => computeStats(rows, habits), [rows, habits]);

    /* Ambil ulang data. Dipanggil sekali + tiap REFRESH_MS */
    const refresh = useCallback(async () => {
        try {
            const r = await fetchPublicScores();
            setRows(r);
            const t = new Date().toLocaleTimeString('id-ID');
            setSync({ ok: true, msg: isConfigured ? `Tersinkron ${t}` : 'Supabase belum terhubung' });
        } catch (e) {
            console.warn(e);
            setRows([]);
            setSync({ ok: false, msg: 'Gagal sinkron' });
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, REFRESH_MS);
        return () => clearInterval(id);
    }, [refresh]);

    useEffect(() => {
        if (refreshSignal > 0) refresh();
    }, [refreshSignal, refresh]);

    /* Doughnut */
    useEffect(() => {
        const ctx = pieRef.current?.getContext('2d');
        if (!ctx) return;
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Sangat Konsisten (3.0-4.0)', 'Cukup Konsisten (2.0-2.9)', 'Perlu Ditingkatkan (<2.0)'],
                datasets: [{ data: stats.tiers, backgroundColor: ['#16a34a', '#f59e0b', '#ef4444'], borderWidth: 2, borderColor: '#ffffff' }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 } } } }
            }
        });
        return () => chart.destroy();
    }, [stats]);

    /* Bar */
    useEffect(() => {
        const ctx = barRef.current?.getContext('2d');
        if (!ctx) return;
        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: habits.map(h => h.short_label || h.name),
                datasets: [{
                    label: 'Skor Rata-Rata (Skala 0-4)',
                    data: stats.habitMeans.map(v => Number(f2(v))),
                    backgroundColor: '#22c55e', hoverBackgroundColor: '#15803d', borderRadius: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, max: 4, ticks: { stepSize: 1, font: { family: 'Inter', size: 11 } } },
                    x: { ticks: { font: { family: 'Inter', size: 11 } } }
                },
                plugins: { legend: { display: false } }
            }
        });
        return () => chart.destroy();
    }, [stats, habits]);

    return (
        <div id="diagram" className="space-y-6 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <i className="fa-solid fa-chart-column text-smala-600"></i> <span>{T('diagram_title')}</span>
                    </h3>
                    <p className="text-sm text-slate-500">{T('diagram_intro')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ' + (sync.ok ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800')}>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> <span>{sync.msg}</span>
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl card-shadow border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold"><i className="fa-solid fa-users"></i></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Total Pengisi Jurnal</p>
                        <h4 className="text-2xl font-black text-slate-900">{stats.n}</h4>
                        <p className="text-[10px] text-emerald-600 font-medium">murid yang mengisi</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl card-shadow border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold"><i className="fa-solid fa-star"></i></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Rata-Rata Kerajinan</p>
                        <h4 className="text-2xl font-black text-slate-900">{f2(stats.overall)} <span className="text-xs font-normal text-slate-400">/ 4.00</span></h4>
                        <p className="text-[10px] text-blue-600 font-medium"><span>{stats.overallPct}%</span> · Indeks Konsistensi</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl card-shadow border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold"><i className="fa-solid fa-fire"></i></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Kebiasaan Tertinggi</p>
                        <h4 className="text-base font-bold text-slate-900 truncate max-w-[150px]">{stats.topIdx >= 0 ? habits[stats.topIdx].name : '-'}</h4>
                        <p className="text-[10px] text-amber-600 font-medium">Skor Konsistensi Maksimal</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl card-shadow border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold"><i className="fa-solid fa-calendar-day"></i></div>
                    <div>
                        <p className="text-xs text-slate-500 font-medium">Pengisi Hari Ini</p>
                        <h4 className="text-2xl font-black text-slate-900">{stats.todayCount}</h4>
                        <p className="text-[10px] text-purple-600 font-medium">murid hari ini</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 lg:col-span-1 flex flex-col">
                    <div className="mb-4">
                        <h4 className="font-bold text-slate-900 text-base">Diagram Lingkaran: Tingkat Kedisiplinan</h4>
                        <p className="text-xs text-slate-500">Persentase murid per kategori (Rendah - Sangat Tinggi)</p>
                    </div>
                    <div className="relative flex-grow flex items-center justify-center min-h-[260px]"><canvas ref={pieRef}></canvas></div>
                </div>
                <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100 lg:col-span-2 flex flex-col">
                    <div className="mb-4">
                        <h4 className="font-bold text-slate-900 text-base">Diagram Batang: Skor Rata-Rata Per Kebiasaan</h4>
                        <p className="text-xs text-slate-500">Perbandingan rata-rata nilai tiap indikator 7 KAIH (Skala 0 - 4)</p>
                    </div>
                    <div className="relative flex-grow flex items-center justify-center min-h-[260px]"><canvas ref={barRef}></canvas></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl card-shadow border border-slate-100">
                <h4 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-smala-600"></i> Persentase Skor Per Kebiasaan (7 KAIH)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {habits.map((h, i) => {
                        const v = stats.habitMeans[i] || 0;
                        const pct = Math.round(v / 4 * 100);
                        return (
                            <div key={h.id ?? i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-800">
                                    <span className="truncate">{h.name}</span>
                                    <span className="text-smala-700 font-bold">{f2(v)}/4 · {pct}%</span>
                                </div>
                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                    <div className="bg-smala-600 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-1 text-right">{pct}% Kelengkapan</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
