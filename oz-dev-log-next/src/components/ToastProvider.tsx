"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastCtx = { show: (msg: string) => void };
const Ctx = createContext<ToastCtx>({ show: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const show = useCallback((m: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg(m);
    timerRef.current = setTimeout(() => setMsg(null), 3000);
  }, []);

  return (
    <Ctx value={{ show }}>
      {children}
      {msg && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
          {msg}
        </div>
      )}
    </Ctx>
  );
}
