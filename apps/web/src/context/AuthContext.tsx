"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = { id: string; name: string; email: string };
type Organization = { id: string; name: string };
type AuthState = {
  user: AuthUser | null;
  organization: Organization | null;
  role: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getSession() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) return null;
  return response.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      setUser(session?.user ?? null);
      setOrganization(session?.organization ?? null);
      setRole(session?.role ?? null);
    } catch {
      setUser(null);
      setOrganization(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const logout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setUser(null);
      setOrganization(null);
      setRole(null);
    }
  };

  const value = useMemo(
    () => ({ user, organization, role, loading, logout, refresh }),
    [user, organization, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
