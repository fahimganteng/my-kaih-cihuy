'use client';

import { CmsProvider } from './CmsProvider';
import { ToastProvider } from './ToastProvider';
import ConfigWarning from './ConfigWarning';
import SiteHeader from './SiteHeader';
import SiteFooter from './SiteFooter';

/* Urutan sama seperti HTML asli: banner peringatan -> header -> isi halaman -> footer */
export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <CmsProvider>
            <ToastProvider>
                <ConfigWarning />
                <SiteHeader />
                {children}
                <SiteFooter />
            </ToastProvider>
        </CmsProvider>
    );
}
