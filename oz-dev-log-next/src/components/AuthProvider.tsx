"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api-client";
import { getStoredToken, clearStoredToken } from "@/lib/client-auth";
import type { User } from "@/lib/types";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  logout: () => void;
  refresh: () => void;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  logout: () => {},
  refresh: () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await fetchApi<User>("/api/auth/me");
      setUser(u);
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <Ctx value={{ user, loading, logout, refresh: fetchMe }}>
      {children}
    </Ctx>
  );
}
