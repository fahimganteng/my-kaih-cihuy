'use client';

import { useCms } from './CmsProvider';

export default function SiteFooter() {
    const { ready, T } = useCms();
    if (!ready) return <footer></footer>;
    return (
        <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4">
                <p className="font-bold text-slate-800">{T('school_name')} &copy; {new Date().getFullYear()}</p>
                <p className="mt-1">{T('footer_text')}</p>
            </div>
        </footer>
    );
}
