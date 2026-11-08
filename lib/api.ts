/* Lapisan akses data Supabase (semua pemanggilan lewat sini) */
import { sb } from './supabase';
import {
    DEFAULT_HABITS, DEFAULT_TEAM, DEFAULT_TEXTS,
    type AdminRow, type Cms, type Habit, type ScoreRow, type TeamMember
} from './defaults';

async function rpc<T = unknown>(name: string, args: Record<string, unknown> = {}): Promise<T> {
    if (!sb) throw new Error('NOT_CONFIGURED');
    const { data, error } = await sb.rpc(name, args);
    if (error) throw error;
    return data as T;
}

/* ---------- Publik ---------- */
export async function loadCMS(): Promise<Cms> {
    const texts = { ...DEFAULT_TEXTS };
    let habits: Habit[] = DEFAULT_HABITS.slice();
    let team: TeamMember[] = DEFAULT_TEAM.slice();

    if (sb) {
        try {
            const [t, h, m] = await Promise.all([
                sb.from('site_texts').select('key,value'),
                sb.from('habits').select('*').order('position'),
                sb.from('team_members').select('*').order('position')
            ]);
            if (!t.error && t.data) (t.data as { key: string; value: string }[]).forEach(r => { texts[r.key] = r.value; });
            if (!h.error && h.data && h.data.length) habits = h.data as Habit[];
            if (!m.error && m.data && m.data.length) team = m.data as TeamMember[];
        } catch (e) { console.warn('CMS fallback ke data bawaan:', e); }
    }
    return { texts, habits, team };
}

/* Skor semua pengisi TANPA nama (aman untuk publik) */
export async function fetchPublicScores(): Promise<ScoreRow[]> {
    if (!sb) return [];
    return (await rpc<ScoreRow[] | null>('get_public_scores')) || [];
}

export async function submitEntry(payload: {
    nama: string; absen: number; kelas: string; tanggal: string; scores: (number | null)[][];
}) {
    return rpc('submit_entry', {
        p_nama: payload.nama,
        p_absen: payload.absen,
        p_kelas: payload.kelas,
        p_tanggal: payload.tanggal,
        p_scores: payload.scores
    });
}

/* ---------- Admin (dilindungi password di sisi server) ---------- */
const ADMIN_SESSION_KEY = 'nexara_admin_pass';

export const getAdminPass = (): string => {
    try { return sessionStorage.getItem(ADMIN_SESSION_KEY) || ''; } catch { return ''; }
};
export const setAdminPass = (p: string) => { try { sessionStorage.setItem(ADMIN_SESSION_KEY, p); } catch { /* abaikan */ } };
export const clearAdminPass = () => { try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* abaikan */ } };

export const adminCheck = (p: string) => rpc<boolean>('admin_check', { p_password: p });
export const adminFetchAll = () => rpc<AdminRow[] | null>('admin_get_submissions', { p_password: getAdminPass() });
export const adminDeleteOne = (id: number | string) => rpc('admin_delete_submission', { p_password: getAdminPass(), p_id: id });
export const adminDeleteAll = () => rpc('admin_delete_all_submissions', { p_password: getAdminPass() });
export const adminSaveHabits = (arr: unknown[]) => rpc('admin_save_habits', { p_password: getAdminPass(), p_data: arr });
export const adminSaveTeam = (arr: unknown[]) => rpc('admin_save_team', { p_password: getAdminPass(), p_data: arr });
export const adminSaveTexts = (obj: Record<string, string>) => rpc('admin_save_texts', { p_password: getAdminPass(), p_data: obj });
