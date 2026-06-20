import { useAuth } from "../features/auth/context/AuthContext";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  return <div>Dashboard Test {user?.email ?? 'No user'}</div>;
}
