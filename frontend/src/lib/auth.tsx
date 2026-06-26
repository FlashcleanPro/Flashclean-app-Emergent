// Supabase-backed auth provider for FlashClean.
// Replaces all previous custom JWT / Emergent Google auth.
// On sign-in / sign-up we ensure a client_profiles row exists for the user.

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

import * as Linking from "expo-linking";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/src/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

export type ClientProfile = {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  floor: string | null;
  preferred_payment: string | null;
};

async function ensureClientProfile(user: User): Promise<ClientProfile | null> {
  // Reuse the existing row keyed by user_id.
  const { data: existing, error: findErr } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (findErr) {
    // eslint-disable-next-line no-console
    console.warn("client_profiles lookup failed", findErr.message);
    return null;
  }
  if (existing) return existing as ClientProfile;

  const meta = user.user_metadata ?? {};
  const inserted = await supabase
    .from("client_profiles")
    .insert({
      user_id: user.id,
      full_name: meta.full_name || meta.name || null,
      phone: meta.phone || null,
    })
    .select("*")
    .single();
  if (inserted.error) {
    // eslint-disable-next-line no-console
    console.warn("client_profiles insert failed", inserted.error.message);
    return null;
  }
  return inserted.data as ClientProfile;
}

type AuthState = {
  session: Session | null;
  user: User | null;
  profile: ClientProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ needsConfirmation: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async (next: Session | null) => {
    setSession(next);
    if (next?.user) {
      const p = await ensureClientProfile(next.user);
      setProfile(p);
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      await hydrate(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      await hydrate(next);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [hydrate]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: fullName ?? null } },
    });
    if (error) throw error;
    // If email confirmation is enabled, session is null.
    return { needsConfirmation: !data.session };
  };

  const signInWithGoogle = async () => {
    if (Platform.OS === "web") {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/" },
      });
      if (error) throw error;
      return;
    }
    const redirectTo = Linking.createURL("auth");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success" || !result.url) return;
    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode) throw new Error(errorCode);
    const access_token = params.access_token;
    const refresh_token = params.refresh_token;
    if (!access_token || !refresh_token) throw new Error("Sessão Google inválida.");
    const { error: setErr } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });
    if (setErr) throw setErr;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (!session?.user) return;
    const p = await ensureClientProfile(session.user);
    setProfile(p);
  };

  return (
    <AuthCtx.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
