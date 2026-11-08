'use client';

import { useState } from 'react';
import { TEXT_META, type Cms } from '@/lib/defaults';
import { adminSaveHabits, adminSaveTeam, adminSaveTexts } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

/* Admin: editor pengaturan (Kebiasaan, Tim pembuat, Teks halaman) */

const inputCls = 'w-full px-3 py-2 rounded-lg border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-smala-500';
const tabCls = (on: boolean) =>
    'sub-btn tab-btn px-4 py-2 rounded-lg text-sm font-semibold border border-transparent text-slate-600 hover:bg-slate-100 transition' + (on ? ' is-active' : '');

function SaveButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button onClick={onClick} className="px-6 py-2.5 rounded-xl bg-smala-700 hover:bg-smala-600 text-white font-bold text-sm shadow-lg transition transform active:scale-95 flex items-center gap-2">
            <i className="fa-solid fa-floppy-disk"></i> {label}
        </button>
    );
}

type HabitDraft = { icon: string; name: string; short_label: string; description: string; statements: string };
type TeamDraft = { name: string; role: string; photo_url: string };

/* ---------- KEBIASAAN ---------- */
function HabitsEditor({ cms, runSave }: { cms: Cms; runSave: RunSave }) {
    const { showToast } = useToast();
    const [draft, setDraft] = useState<HabitDraft[]>(() =>
        cms.habits.map(h => ({
            icon: h.icon, name: h.name, short_label: h.short_label, description: h.description || '', statements: h.statements
        }))
    );
    const set = (i: number, f: keyof HabitDraft, v: string) =>
        setDraft(d => d.map((x, k) => (k === i ? { ...x, [f]: v } : x)));

    const save = async () => {
        const arr = draft.map(h => ({
            icon: h.icon.trim(), name: h.name.trim(), short_label: h.short_label.trim(),
            description: h.description.trim(), statements: h.statements.trim()
        }));
        if (arr.some(h => !h.name || !h.statements)) { showToast('Gagal', 'Nama dan pernyataan tidak boleh kosong.', 'error'); return; }
        await runSave(() => adminSaveHabits(arr), 'Kebiasaan');
    };

    return (
        <div className="space-y-4">
            <p className="text-xs text-slate-500">Ikon memakai nama kelas Font Awesome (mis. <code>fa-sun</code>). Pernyataan: <b>satu pernyataan per baris</b>.</p>
            {draft.map((h, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                    <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center"><i className={`fa-solid ${cms.habits[i]?.icon ?? h.icon}`}></i></div>
                        Kebiasaan {i + 1}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ikon</label><input className={inputCls} value={h.icon} onChange={e => set(i, 'icon', e.target.value)} placeholder="fa-sun" /></div>
                        <div className="md:col-span-2"><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nama kebiasaan</label><input className={inputCls} value={h.name} onChange={e => set(i, 'name', e.target.value)} /></div>
                        <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Label singkat (diagram)</label><input className={inputCls} value={h.short_label} onChange={e => set(i, 'short_label', e.target.value)} /></div>
                    </div>
                    <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Keterangan singkat (kartu Beranda)</label><input className={inputCls} value={h.description} onChange={e => set(i, 'description', e.target.value)} /></div>
                    <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Pernyataan lengkap untuk Laman Murid</label><textarea rows={3} className={inputCls} value={h.statements} onChange={e => set(i, 'statements', e.target.value)} /></div>
                </div>
            ))}
            <div className="flex justify-end"><SaveButton label="Simpan Kebiasaan" onClick={save} /></div>
        </div>
    );
}

/* ---------- TIM PEMBUAT ---------- */
function TeamEditor({ cms, runSave }: { cms: Cms; runSave: RunSave }) {
    const [draft, setDraft] = useState<TeamDraft[]>(() =>
        cms.team.map(m => ({ name: m.name, role: m.role, photo_url: m.photo_url || '' }))
    );
    const set = (i: number, f: keyof TeamDraft, v: string) =>
        setDraft(d => d.map((x, k) => (k === i ? { ...x, [f]: v } : x)));

    const save = async () => {
        const arr = draft
            .map(m => ({ name: m.name.trim(), role: m.role.trim(), photo_url: m.photo_url.trim() }))
            .filter(m => m.name);
        await runSave(() => adminSaveTeam(arr), 'Tim pembuat');
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                            <th className="p-3 w-10">#</th><th className="p-3">Nama</th><th className="p-3">Peran/jabatan</th><th className="p-3">URL foto (opsional)</th><th className="p-3 w-16 text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {draft.map((m, i) => (
                            <tr key={i}>
                                <td className="p-2 text-center font-bold">{i + 1}</td>
                                <td className="p-2"><input className={inputCls} value={m.name} onChange={e => set(i, 'name', e.target.value)} /></td>
                                <td className="p-2"><input className={inputCls} value={m.role} onChange={e => set(i, 'role', e.target.value)} /></td>
                                <td className="p-2"><input className={inputCls} value={m.photo_url} onChange={e => set(i, 'photo_url', e.target.value)} placeholder="https://… atau /foto.jpg" /></td>
                                <td className="p-2 text-center"><button onClick={() => setDraft(d => d.filter((_, k) => k !== i))} className="text-rose-600 hover:text-rose-800 font-bold" title="Hapus">✕</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center">
                <button onClick={() => setDraft(d => [...d, { name: '', role: '', photo_url: '' }])} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition">+ Tambah anggota</button>
                <SaveButton label="Simpan Tim" onClick={save} />
            </div>
        </div>
    );
}

/* ---------- TEKS HALAMAN ---------- */
function TextsEditor({ cms, runSave }: { cms: Cms; runSave: RunSave }) {
    const [draft, setDraft] = useState<Record<string, string>>(() => {
        const o: Record<string, string> = {};
        TEXT_META.forEach(m => { o[m.key] = cms.texts[m.key] ?? ''; });
        return o;
    });

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                    <thead><tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider"><th className="p-3 w-48">Bagian</th><th className="p-3">Isi teks</th></tr></thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                        {TEXT_META.map(m => (
                            <tr key={m.key}>
                                <td className="p-2 align-top"><div className="font-semibold text-slate-800">{m.section}</div><div className="text-[10px] text-slate-400">{m.label}</div></td>
                                <td className="p-2">
                                    {m.multiline
                                        ? <textarea rows={3} className={inputCls} value={draft[m.key]} onChange={e => setDraft(d => ({ ...d, [m.key]: e.target.value }))} />
                                        : <input className={inputCls} value={draft[m.key]} onChange={e => setDraft(d => ({ ...d, [m.key]: e.target.value }))} />}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-end"><SaveButton label="Simpan Teks" onClick={() => runSave(() => adminSaveTexts(draft), 'Teks halaman')} /></div>
        </div>
    );
}

export type RunSave = (fn: () => Promise<unknown>, label: string) => Promise<void>;

export default function SettingsTab({ cms, runSave, version }: { cms: Cms; runSave: RunSave; version: number }) {
    const [sub, setSub] = useState<'habits' | 'team' | 'texts'>('habits');

    return (
        <div className="bg-white rounded-2xl p-6 sm:p-8 card-shadow border border-slate-100 space-y-6">
            <div className="flex flex-wrap gap-2">
                <button onClick={() => setSub('habits')} className={tabCls(sub === 'habits')}>Kebiasaan</button>
                <button onClick={() => setSub('team')} className={tabCls(sub === 'team')}>Tim pembuat</button>
                <button onClick={() => setSub('texts')} className={tabCls(sub === 'texts')}>Teks halaman</button>
            </div>
            <p className="text-xs text-slate-500">Perubahan di sini memengaruhi seluruh laman (Beranda, Diagram, Laman Murid, dan Tentang).</p>

            <div className={'space-y-4' + (sub === 'habits' ? '' : ' hidden')}><HabitsEditor key={version} cms={cms} runSave={runSave} /></div>
            <div className={'space-y-4' + (sub === 'team' ? '' : ' hidden')}><TeamEditor key={version} cms={cms} runSave={runSave} /></div>
            <div className={'space-y-4' + (sub === 'texts' ? '' : ' hidden')}><TextsEditor key={version} cms={cms} runSave={runSave} /></div>
        </div>
    );
}
