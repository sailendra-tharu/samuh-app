import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfileRole } from "@/api/profile";
import { getMetadataRole, type UserRole } from "@/lib/access";

/* eslint-disable react-refresh/only-export-components -- This module intentionally exports the auth provider and its hook. */

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  role: UserRole;
  isAdmin: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error(error);
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setAuthLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const profileRoleQuery = useQuery({
    queryKey: ["profile-role", user?.id],
    queryFn: () => getProfileRole(user?.id ?? ""),
    enabled: user !== null,
    retry: false,
    staleTime: 0,
    refetchOnMount: "always",
  });
  const role: UserRole = profileRoleQuery.data ?? getMetadataRole(user);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    queryClient.removeQueries({ queryKey: ["profile-role"] });
    queryClient.removeQueries({ queryKey: ["member-section-access"] });
  };

  const value: AuthContextType = {
    user,
    session,
    loading: authLoading || (user !== null && profileRoleQuery.isLoading),
    isAuthenticated: !!session,
    role,
    isAdmin: role === "admin",
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
