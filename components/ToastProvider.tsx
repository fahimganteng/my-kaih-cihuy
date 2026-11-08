'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type ToastType = 'ok' | 'error';
type ToastFn = (title: string, message: string, type?: ToastType) => void;

const Ctx = createContext<ToastFn | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toast, setToast] = useState<{ title: string; message: string; bad: boolean } | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = useCallback<ToastFn>((title, message, type) => {
        setToast({ title, message, bad: type === 'error' });
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setToast(null), 4000);
    }, []);

    useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

    const value = useMemo(() => showToast, [showToast]);

    return (
        <Ctx.Provider value={value}>
            {children}
            {toast && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 max-w-sm transition">
                    <div className={`w-9 h-9 rounded-xl ${toast.bad ? 'bg-rose-500' : 'bg-emerald-500'} text-white flex items-center justify-center flex-shrink-0 text-lg`}>
                        <i className={`fa-solid ${toast.bad ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
                    </div>
                    <div>
                        <h5 className="font-bold text-sm">{toast.title}</h5>
                        <p className="text-xs text-slate-300">{toast.message}</p>
                    </div>
                </div>
            )}
        </Ctx.Provider>
    );
}

export function useToast() {
    const showToast = useContext(Ctx);
    if (!showToast) throw new Error('useToast harus dipakai di dalam <ToastProvider>');
    return { showToast };
}
