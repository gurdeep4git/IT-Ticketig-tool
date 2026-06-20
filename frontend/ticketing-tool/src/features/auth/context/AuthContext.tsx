import { createContext, useContext, useState } from "react";

type User = { email: string, role:string };

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
  isAuthenticated: boolean;
  isAdmin:boolean;
};

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const isAuthenticated = user !== null;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};