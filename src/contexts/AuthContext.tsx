import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type AppPerfil = Database["public"]["Enums"]["app_perfil"];

interface UsuarioInfo {
  id: string;
  nome: string;
  email: string;
  perfil: AppPerfil;
  ativo: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  usuario: UsuarioInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isPerfil: (perfil: AppPerfil) => boolean;
  isCongal: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [usuario, setUsuario] = useState<UsuarioInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUsuario = async (userId: string) => {
    const { data } = await supabase
      .from("usuarios")
      .select("*")
      .eq("user_id", userId)
      .eq("ativo", true)
      .maybeSingle();

    if (data) {
      setUsuario({
        id: data.id,
        nome: data.nome,
        email: data.email,
        perfil: data.perfil,
        ativo: data.ativo,
      });
    } else {
      setUsuario(null);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          setTimeout(() => fetchUsuario(session.user.id), 0);
        } else {
          setUsuario(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUsuario(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUsuario(null);
  };

  const isPerfil = (perfil: AppPerfil) => usuario?.perfil === perfil || usuario?.perfil === "congal";
  const isCongal = usuario?.perfil === "congal";

  return (
    <AuthContext.Provider value={{ session, user, usuario, loading, signIn, signOut, isPerfil, isCongal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
