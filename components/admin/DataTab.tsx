'use client';

import { Fragment, useState } from 'react';
import { habitAvgOfRow } from '@/lib/stats';
import { classOptions, fmtTime } from '@/lib/utils';
import type { AdminRow, Habit } from '@/lib/defaults';

/* Admin: tabel data Supabase */
export default function DataTab({
    rows, habits, onDelete, onClear
}: {
    rows: AdminRow[];
    habits: Habit[];
    onDelete: (id: number | string) => void;
    onClear: () => void;
}) {
    const [search, setSearch] = useState('');
    const [kelas, setKelas] = useState('ALL');

    const q = search.toLowerCase();
    const filtered = rows.filter(r => r.nama.toLowerCase().includes(q) && (kelas === 'ALL' || r.kelas === kelas));
    const cols = 7 + habits.length;

    const th = (t: string, extra?: string) => (
        <th className={`p-3 border-r border-slate-200 ${extra || ''}`} title={t}>{t}</th>
    );

    return (
        <div className="bg-white rounded-2xl p-6 sm:p-8 card-shadow border border-slate-100 space-y-6">
            <div>
                <h3 className="text-xl font-extrabold text-slate-900">Spreadsheet Data Pengisian 7 KAIH</h3>
                <p className="text-xs sm:text-sm text-slate-500">Tampilan lengkap basis data pengisian murid dari Supabase (diperbarui tiap 15 detik).</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Cari Nama Siswa</label>
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-sm"></i>
                        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ketik nama murid..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-smala-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Filter Kelas</label>
                    <select value={kelas} onChange={e => setKelas(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-smala-500">
                        <option value="ALL">Semua Kelas</option>
                        {classOptions().map(k => <option key={k} value={k}>{k}</option>)}
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                    <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider">
                            {th('Waktu Input')}{th('Nama Siswa')}{th('Absen', 'text-center')}{th('Kelas')}{th('Tanggal')}
                            {habits.map((h, i) => <Fragment key={h.id ?? i}>{th(h.short_label || h.name, 'text-center')}</Fragment>)}
                            <th className="p-3 border-r border-slate-200 text-center bg-emerald-100 text-emerald-900">Rata-Rata</th>
                            <th className="p-3 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={cols} className="p-8 text-center text-slate-400 font-medium">Tidak ada data pengisian murid yang ditemukan.</td>
                            </tr>
                        ) : filtered.map(r => {
                            const per = habits.map((_, i) => habitAvgOfRow(r.scores, i));
                            const valid = per.filter((v): v is number => v !== null);
                            const avg = valid.length ? (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(2) : '-';
                            return (
                                <tr key={r.id} className="hover:bg-slate-50 transition">
                                    <td className="p-3 border-r border-slate-200 text-slate-500 whitespace-nowrap">{fmtTime(r.created_at)}</td>
                                    <td className="p-3 border-r border-slate-200 font-semibold text-slate-900 whitespace-nowrap">{r.nama}</td>
                                    <td className="p-3 border-r border-slate-200 text-center font-mono">{r.absen}</td>
                                    <td className="p-3 border-r border-slate-200 whitespace-nowrap"><span className="px-2 py-0.5 rounded bg-slate-100 font-medium">{r.kelas}</span></td>
                                    <td className="p-3 border-r border-slate-200 whitespace-nowrap">{r.tanggal}</td>
                                    {per.map((v, i) => (
                                        <td key={i} className="p-3 border-r border-slate-200 text-center">{v === null ? '-' : v.toFixed(2)}</td>
                                    ))}
                                    <td className="p-3 border-r border-slate-200 text-center font-black bg-emerald-100 text-emerald-900">{avg}</td>
                                    <td className="p-3 text-center whitespace-nowrap">
                                        <button onClick={() => onDelete(r.id)} className="text-rose-600 hover:text-rose-800 p-1" title="Hapus Data"><i className="fa-solid fa-trash-can"></i></button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
                <span>Menampilkan {filtered.length} dari {rows.length} data pengisian</span>
                <button onClick={onClear} className="text-rose-600 hover:underline font-semibold flex items-center gap-1"><i className="fa-solid fa-trash"></i> Reset / Hapus Semua Data</button>
            </div>
        </div>
    );
}
