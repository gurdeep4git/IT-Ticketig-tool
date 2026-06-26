import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
};

type ApiResponse = {
  data: User;
  status: boolean;
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
  isAdmin:boolean;
  isAgent:boolean;
  isUser:boolean;
  loading:boolean;
};

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/auth/me", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Not authenticated");
        }
        return res.json();
      })
      .then((res: ApiResponse) => setUser(res?.data ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';
  const isAgent = user?.role === 'agent';
  const isUser = user?.role === 'user';

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isAdmin, isAgent, isUser, loading}}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};