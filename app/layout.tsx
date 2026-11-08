import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/Providers';

export const metadata: Metadata = {
    title: 'NEXARA 7 KAIH - SMA Negeri 5 Semarang'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="id">
            <head>
                {/* Font Awesome Icons */}
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
                {/* Google Fonts (Inter) */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="text-slate-800 flex flex-col min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
