import type { Habit } from './defaults';

export const habitStatements = (h: Habit): string[] =>
    String(h.statements || '').split('\n').map(s => s.trim()).filter(Boolean);

export const HABIT_COLORS = [
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700' },
    { bg: 'bg-rose-100', text: 'text-rose-700' },
    { bg: 'bg-teal-100', text: 'text-teal-700' }
];

/* Daftar kelas X-1 ... XII-12 */
export function classOptions(): string[] {
    const out: string[] = [];
    ['X', 'XI', 'XII'].forEach(t => { for (let i = 1; i <= 12; i++) out.push(`${t}-${i}`); });
    return out;
}

export const NAV_ITEMS = [
    { id: 'beranda', href: '/', icon: 'fa-chart-pie', key: 'menu_beranda' },
    { id: 'diagram', href: '/#diagram', icon: 'fa-chart-column', key: 'menu_diagram' },
    { id: 'murid', href: '/murid', icon: 'fa-pen-to-square', key: 'menu_murid' },
    { id: 'admin', href: '/admin', icon: 'fa-user-shield', key: 'menu_admin' },
    { id: 'tentang', href: '/tentang', icon: 'fa-users', key: 'menu_tentang' }
];

export function localToday(): string {
    return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

export function fmtTime(iso?: string): string {
    if (!iso) return '-';
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
