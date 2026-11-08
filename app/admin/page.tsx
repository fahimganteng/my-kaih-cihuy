'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCms, usePageTitle } from '@/components/CmsProvider';
import { useToast } from '@/components/ToastProvider';
import DiagramSection from '@/components/DiagramSection';
import DataTab from '@/components/admin/DataTab';
import SettingsTab from '@/components/admin/SettingsTab';
import {
    adminCheck, adminDeleteAll, adminDeleteOne, adminFetchAll,
    clearAdminPass, getAdminPass, setAdminPass
} from '@/lib/api';
import { exportCSV } from '@/lib/csv';
import { isConfigured, REFRESH_MS } from '@/lib/supabase';
import type { AdminRow } from '@/lib/defaults';

type Tab = 'diagram' | 'data' | 'settings';

const errMsg = (e: unknown) => String((e && (e as { message?: string }).message) || e);
const tabCls = (on: boolean) =>
    'tab-btn px-4 py-2 rounded-lg text-sm font-semibold border border-transparent text-slate-600 hover:bg-slate-100 transition' + (on ? ' is-active' : '');

/* Laman Admin: login, tab, auto-refresh */
export default function AdminPage() {
    const { cms, T, reload } = useCms();
    const { showToast } = useToast();
    const router = useRouter();
    usePageTitle('admin_title');

    const [authed, setAuthed] = useState(false);
    const [sessionChecked, setSessionChecked] = useState(false);
    const [pass, setPass] = useState('');
    const [authError, setAuthError] = useState('');
    const [tab, setTab] = useState<Tab>('diagram');
    const [rows, setRows] = useState<AdminRow[]>([]);
    const [signal, setSignal] = useState(0);
    const [editorVersion, setEditorVersion] = useState(0);

    const loadTable = useCallback(async () => {
        try {
            setRows((await adminFetchAll()) || []);
        } catch (e) {
            console.warn(e);
            if (errMsg(e).includes('UNAUTHORIZED')) { clearAdminPass(); location.reload(); }
        }
    }, []);

    /* Sesi tersimpan? verifikasi ulang */
    useEffect(() => {
        let alive = true;
        (async () => {
            const saved = getAdminPass();
            if (saved && isConfigured) {
                try {
                    if ((await adminCheck(saved)) === true) { if (alive) { setAuthed(true); setSessionChecked(true); } return; }
                } catch { /* lanjut ke modal */ }
                clearAdminPass();
            }
            if (alive) setSessionChecked(true);
        })();
        return () => { alive = false; };
    }, []);

    /* Ambil data pertama kali + otomatis tiap 15 detik */
    useEffect(() => {
        if (!authed) return;
        loadTable();
        const id = setInterval(loadTable, REFRESH_MS);
        return () => clearInterval(id);
    }, [authed, loadTable]);

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setAuthError('');
        if (!isConfigured) { setAuthError('Supabase belum terhubung (isi .env.local).'); return; }
        try {
            const ok = await adminCheck(pass);
            if (ok === true) {
                setAdminPass(pass);
                setAuthed(true);
                showToast('Akses Diberikan', 'Selamat datang di Laman Admin!');
            } else {
                setAuthError('Password salah! Silakan coba lagi.');
            }
        } catch (ex) {
            setAuthError('Gagal menghubungi server: ' + errMsg(ex));
        }
    }

    async function handleDelete(id: number | string) {
        if (!confirm('Apakah Anda yakin ingin menghapus data pengisian siswa ini?')) return;
        try {
            await adminDeleteOne(id);
            await loadTable();
            setSignal(s => s + 1);
            showToast('Data Dihapus', 'Satu tanggapan siswa telah dihapus.');
        } catch (err) { showToast('Gagal', errMsg(err), 'error'); }
    }

    async function handleClear() {
        if (!confirm('PERINGATAN! Semua data pengisian murid akan dihapus permanen. Lanjutkan?')) return;
        try {
            await adminDeleteAll();
            await loadTable();
            setSignal(s => s + 1);
            showToast('Reset Berhasil', 'Semua data pengisian dikosongkan.');
        } catch (err) { showToast('Gagal', errMsg(err), 'error'); }
    }

    function handleExport() {
        if (!exportCSV(rows, cms.habits)) { alert('Tidak ada data untuk diekspor!'); return; }
        showToast('Ekspor Berhasil', 'File CSV data 7 KAIH berhasil diunduh.');
    }

    /* Simpan -> muat ulang CMS -> segarkan seluruh tampilan admin */
    const runSave = useCallback(async (fn: () => Promise<unknown>, label: string) => {
        try {
            await fn();
            await reload();
            setEditorVersion(v => v + 1);
            setSignal(s => s + 1);
            loadTable();
            showToast('Tersimpan', `${label} berhasil diperbarui di seluruh laman.`);
        } catch (e) {
            showToast('Gagal Menyimpan', errMsg(e), 'error');
        }
    }, [reload, loadTable, showToast]);

    return (
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

            {/* PANEL ADMIN (tersembunyi sampai login) */}
            {authed && (
                <section className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 sm:p-8 card-shadow border border-slate-100 space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                    <i className="fa-solid fa-lock text-[10px]"></i> SMAN 5 Admin Protected
                                </span>
                                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">{T('admin_title')}</h2>
                                <p className="text-xs sm:text-sm text-slate-500">Diagram, basis data Supabase, dan pengaturan seluruh isi web.</p>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <button onClick={() => { setSignal(s => s + 1); loadTable(); showToast('Dimuat ulang', 'Data terbaru berhasil diambil.'); }}
                                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center gap-1.5"><i className="fa-solid fa-rotate"></i> Muat Ulang</button>
                                <button onClick={handleExport}
                                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold text-xs transition flex items-center gap-1.5"><i className="fa-solid fa-file-csv"></i> Ekspor CSV / Excel</button>
                                <button onClick={() => { clearAdminPass(); router.push('/'); }}
                                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold text-xs transition flex items-center gap-1.5"><i className="fa-solid fa-right-from-bracket"></i> Keluar (Logout)</button>
                            </div>
                        </div>

                        {/* Tab utama */}
                        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                            <button onClick={() => setTab('diagram')} className={tabCls(tab === 'diagram')}><i className="fa-solid fa-chart-pie"></i> Diagram</button>
                            <button onClick={() => setTab('data')} className={tabCls(tab === 'data')}><i className="fa-solid fa-table"></i> Data Supabase</button>
                            <button onClick={() => setTab('settings')} className={tabCls(tab === 'settings')}><i className="fa-solid fa-gear"></i> Pengaturan</button>
                        </div>
                    </div>

                    {/* TAB 1: DIAGRAM */}
                    <div className={tab === 'diagram' ? '' : 'hidden'}><div><DiagramSection refreshSignal={signal} /></div></div>

                    {/* TAB 2: TABEL */}
                    <div className={tab === 'data' ? '' : 'hidden'}>
                        <DataTab rows={rows} habits={cms.habits} onDelete={handleDelete} onClear={handleClear} />
                    </div>

                    {/* TAB 3: PENGATURAN */}
                    <div className={tab === 'settings' ? '' : 'hidden'}>
                        <SettingsTab version={editorVersion} cms={cms} runSave={runSave} />
                    </div>
                </section>
            )}

            {/* Modal Password Admin */}
            {sessionChecked && !authed && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 card-shadow space-y-5">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-slate-900 font-bold">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center"><i className="fa-solid fa-key"></i></div>
                                <span>Verifikasi Akses Admin</span>
                            </div>
                            <Link href="/" className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-xmark text-lg"></i></Link>
                        </div>
                        <p className="text-xs text-slate-600">Laman ini berisi data sensitif. Silakan masukkan kata sandi khusus admin untuk melanjutkan.</p>
                        <form onSubmit={handleAuth} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1" htmlFor="admin-pass">Kata Sandi (Password)</label>
                                <input type="password" id="admin-pass" required autoFocus placeholder="Masukkan kata sandi admin..."
                                    value={pass} onChange={e => setPass(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm outline-none focus:ring-2 focus:ring-smala-500" />
                                {authError && (
                                    <p className="text-xs text-rose-600 font-semibold mt-1.5 flex items-center gap-1"><i className="fa-solid fa-circle-exclamation"></i> <span>{authError}</span></p>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Link href="/" className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-semibold">Batal</Link>
                                <button type="submit" className="px-5 py-2 rounded-xl bg-smala-700 hover:bg-smala-600 text-white text-xs font-bold shadow-md">Masuk Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}
