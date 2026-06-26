import { useState } from "react";
import { useAuth } from "../../features/auth/context/AuthContext";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { user } = useAuth();
  const [apiState, setApiState] = useState<{
    loading: boolean;
    error: string | null;
  }>({ loading: false, error: null });
  const navigate = useNavigate();

  const initials = (() => {
    if (!user) return "U";
    const first = user.first_name?.trim() ?? "";
    const last = user.last_name?.trim() ?? "";
    if (first || last)
      return `${first.charAt(0) ?? ""}${last.charAt(0) ?? ""}`.toUpperCase();
    // fallback to email prefix
    const emailPrefix = user.email?.split("@")[0] ?? "user";
    return emailPrefix.charAt(0).toUpperCase();
  })();

  const logout = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json();
        // server-side errors
        setApiState({
          loading: false,
          error: data?.detail ?? "Logout failed",
        });
        return;
      }
      setApiState({ loading: false, error: null });
      navigate("/login");
    } catch (error) {
      // Network failure
      setApiState({
        loading: false,
        error: "Something went wrong. Try again.",
      });
    }
  };

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">IT Ticketing Tool</a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle p-0 bg-transparent avatar"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[#0ea5e9] text-white">
                <span className="font-semibold">{initials}</span>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
            >
              <li>
                <a onClick={logout}>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
