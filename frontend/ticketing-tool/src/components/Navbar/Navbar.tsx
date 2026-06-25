import { useAuth } from "../../features/auth/context/AuthContext";

export const Navbar = () => {
  const { user } = useAuth();

  const initials = (() => {
    if (!user) return "U";
    const first = user.first_name?.trim() ?? "";
    const last = user.last_name?.trim() ?? "";
    if (first || last) return `${first.charAt(0) ?? ""}${last.charAt(0) ?? ""}`.toUpperCase();
    // fallback to email prefix
    const emailPrefix = user.email?.split("@")[0] ?? "user";
    return emailPrefix.charAt(0).toUpperCase();
  })();

  return (
    <>
      <div className="navbar bg-base-100 shadow-sm">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">IT Ticketing Tool</a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle p-0 bg-transparent avatar">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[#0ea5e9] text-white">
                <span className="font-semibold">{initials}</span>
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <li>
                <a>Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
