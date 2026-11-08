'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCms, usePageTitle } from '@/components/CmsProvider';
import { useToast } from '@/components/ToastProvider';
import { submitEntry } from '@/lib/api';
import { isConfigured } from '@/lib/supabase';
import { HABIT_COLORS, classOptions, habitStatements, localToday } from '@/lib/utils';

type AlertState = { type: 'ok' | 'err'; content: React.ReactNode } | null;

/* Laman Murid: form harian skala 0-4, kirim ke Supabase */
export default function MuridPage() {
    const { cms, T } = useCms();
    const { showToast } = useToast();
    const router = useRouter();
    usePageTitle('murid_title');

    const [nama, setNama] = useState('');
    const [absen, setAbsen] = useState('');
    const [kelas, setKelas] = useState('');
    const [tanggal, setTanggal] = useState('');
    const [maxDate, setMaxDate] = useState<string | undefined>(undefined);
    const [alert, setAlert] = useState<AlertState>(null);
    const [submitting, setSubmitting] = useState(false);

    const alertRef = useRef<HTMLDivElement>(null);
    const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const d = localToday();
        setTanggal(d);
        setMaxDate(d);
        return () => { if (redirectTimer.current) clearTimeout(redirectTimer.current); };
    }, []);

    useEffect(() => {
        if (alert) alertRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [alert]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;

        const namaClean = nama.trim().replace(/\s+/g, ' ');
        const absenNum = parseInt(absen, 10);

        const scores = cms.habits.map((h, hi) =>
            habitStatements(h).map((_, si) => {
                const r = form.querySelector<HTMLInputElement>(`input[name="s_${hi}_${si}"]:checked`);
                return r ? parseInt(r.value, 10) : null;
            })
        );
        if (scores.some(a => a.some(v => v === null))) {
            setAlert({ type: 'err', content: 'Mohon jawab semua pernyataan (skala 0–4).' });
            return;
        }
        if (tanggal > localToday()) {
            setAlert({ type: 'err', content: 'Tanggal pengisian tidak boleh melebihi hari ini.' });
            return;
        }
        if (!isConfigured) {
            setAlert({ type: 'err', content: 'Gagal mengirim: Supabase belum terhubung. Hubungi admin (.env.local belum diisi).' });
            return;
        }

        setSubmitting(true);
        try {
            await submitEntry({ nama: namaClean, absen: absenNum, kelas, tanggal, scores });
            setAlert({ type: 'ok', content: <>Jawaban berhasil dikirim! Terima kasih, <b>{namaClean}</b>. Mengalihkan ke diagram...</> });
            showToast('Jawaban Berhasil Dikirim!', 'Data masuk ke diagram dan tabel admin.');
            form.reset();
            setNama(''); setAbsen(''); setKelas('');
            setTanggal(localToday());
            redirectTimer.current = setTimeout(() => router.push('/#diagram'), 2200);
        } catch (err) {
            const msg = String((err && (err as { message?: string }).message) || err);
            if (msg.includes('DUPLICATE_ENTRY')) {
                setAlert({ type: 'err', content: <>Gagal: nama <b>{namaClean}</b> sudah mengisi pada tanggal <b>{tanggal}</b>. Satu nama hanya bisa mengisi satu kali per hari.</> });
                showToast('Gagal Mengirim', 'Nama ini sudah mengisi pada tanggal tersebut.', 'error');
            } else {
                setAlert({ type: 'err', content: 'Gagal mengirim jawaban: ' + msg });
                showToast('Gagal Mengirim', 'Terjadi kesalahan. Coba lagi.', 'error');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <section className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl p-6 sm:p-8 card-shadow border border-slate-100">
                    <div className="border-b border-slate-100 pb-5 mb-6">
                        <Link href="/" className="text-xs font-bold text-smala-700 hover:underline mb-2 flex items-center gap-1">
                            <i className="fa-solid fa-arrow-left"></i> Kembali ke <span>{T('menu_beranda')}</span>
                        </Link>
                        <h2 className="text-2xl font-extrabold text-slate-900">{T('murid_title')}</h2>
                        <p className="text-xs sm:text-sm text-slate-500 mt-1">{T('murid_intro')}</p>
                    </div>

                    {/* Pesan sukses / gagal */}
                    {alert && (
                        <div
                            ref={alertRef}
                            className={'mb-5 p-4 rounded-xl text-sm font-semibold flex items-start gap-2 ' +
                                (alert.type === 'ok' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200')}
                        >
                            <i className={`fa-solid ${alert.type === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation'} mt-0.5`}></i>
                            <div>{alert.content}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Identitas */}
                        <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-4">
                            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <i className="fa-solid fa-id-card text-smala-600"></i> Data Identitas Siswa
                            </h3>
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="nama">1. Nama Lengkap *</label>
                                <input type="text" id="nama" required maxLength={100} placeholder="Contoh: Ahmad Rizky"
                                    value={nama} onChange={e => setNama(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smala-500 focus:border-smala-500 text-sm outline-none transition" />
                                <p className="text-[11px] text-slate-400 mt-1">Satu nama hanya bisa mengisi satu kali per hari.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="absen">2. Nomor Absen *</label>
                                    <input type="number" id="absen" min={1} max={60} required placeholder="Contoh: 14"
                                        value={absen} onChange={e => setAbsen(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smala-500 focus:border-smala-500 text-sm outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="kelas">3. Kelas *</label>
                                    <select id="kelas" required value={kelas} onChange={e => setKelas(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smala-500 focus:border-smala-500 text-sm outline-none transition">
                                        <option value="" disabled>Pilih Kelas</option>
                                        {classOptions().map(k => <option key={k} value={k}>{k}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="tanggal">4. Tanggal Pengisian *</label>
                                    <input type="date" id="tanggal" required max={maxDate}
                                        value={tanggal} onChange={e => setTanggal(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-smala-500 focus:border-smala-500 text-sm outline-none transition" />
                                </div>
                            </div>
                        </div>

                        {/* Pertanyaan (dibuat dari data kebiasaan) */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                    <i className="fa-solid fa-list-ol text-smala-600"></i> <span>5. Pernyataan Kebiasaan</span>
                                </h3>
                            </div>
                            <p className="text-xs text-slate-500">{T('murid_scale_hint')}</p>
                            <div className="space-y-6">
                                {cms.habits.map((h, hi) => {
                                    const c = HABIT_COLORS[hi % HABIT_COLORS.length];
                                    const stmts = habitStatements(h);
                                    return (
                                        <div key={h.id ?? hi} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-smala-300 transition space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}><i className={`fa-solid ${h.icon}`}></i></div>
                                                <h4 className="font-bold text-smala-700 text-sm">{h.name}</h4>
                                            </div>
                                            {stmts.map((s, si) => (
                                                <Fragment key={si}>
                                                    {si > 0 && <hr className="border-slate-100" />}
                                                    <div className="space-y-3">
                                                        <label className="block text-sm font-medium text-slate-800">{si + 1}. {s}</label>
                                                        <div className="flex justify-between items-start gap-1 sm:gap-3 max-w-md mx-auto">
                                                            {[0, 1, 2, 3, 4].map(v => {
                                                                const lbl = v === 0 ? T('scale_left') : v === 4 ? T('scale_right') : '';
                                                                return (
                                                                    <label key={v} className="flex flex-col items-center cursor-pointer group w-14">
                                                                        <input type="radio" name={`s_${hi}_${si}`} value={v} required className="peer hidden" />
                                                                        <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl border-2 border-slate-200 bg-white flex items-center justify-center font-bold text-sm text-slate-600 peer-checked:bg-smala-700 peer-checked:border-smala-700 peer-checked:text-white group-hover:border-smala-400 transition shadow-sm">{v}</span>
                                                                        <span className="text-[10px] text-slate-400 mt-1 font-medium text-center leading-tight group-hover:text-slate-600">{lbl}</span>
                                                                    </label>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </Fragment>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                            <Link href="/" className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-sm transition">Batal</Link>
                            <button type="submit" disabled={submitting}
                                className={'px-8 py-2.5 rounded-xl bg-smala-700 hover:bg-smala-600 text-white font-bold text-sm shadow-lg hover:shadow-emerald-900/30 transition transform active:scale-95 flex items-center gap-2' + (submitting ? ' opacity-60' : '')}>
                                <i className="fa-solid fa-paper-plane"></i> Kirim Jawaban Jurnal
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </main>
    );
}
