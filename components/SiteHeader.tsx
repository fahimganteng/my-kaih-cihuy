'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCms } from './CmsProvider';
import { NAV_ITEMS } from '@/lib/utils';

function activeId(pathname: string): string {
    if (pathname.startsWith('/murid')) return 'murid';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/tentang')) return 'tentang';
    return 'beranda';
}

export default function SiteHeader() {
    const { ready, T } = useCms();
    const pathname = usePathname() || '/';
    if (!ready) return <header></header>;

    const active = activeId(pathname);

    return (
        <header className="sticky top-0 z-40 glass-header border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-smala-700 text-white flex items-center justify-center font-black text-xl shadow-md">5</div>
                    <div>
                        <h1 className="font-bold text-slate-900 text-lg leading-tight">{T('school_name')}</h1>
                        <p className="text-xs text-smala-700 font-semibold tracking-wide">{T('hero_title').toUpperCase()} 7 KAIH</p>
                    </div>
                </Link>
                <nav className="flex items-center gap-1 sm:gap-2">
                    {NAV_ITEMS.map(n => {
                        const cls = n.id === active
                            ? 'px-3 py-1.5 rounded-lg text-sm font-semibold transition flex items-center gap-1.5 text-smala-700 bg-smala-50 border border-smala-100'
                            : 'px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-600 hover:text-smala-700 hover:bg-slate-100 transition flex items-center gap-1.5';
                        return (
                            <Link key={n.id} href={n.href} className={cls}>
                                <i className={`fa-solid ${n.icon}`}></i> <span className="hidden md:inline">{T(n.key)}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
