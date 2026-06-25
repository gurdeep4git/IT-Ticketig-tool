import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tickets", href: "/tickets" },
  ];

  return (
    <>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ label, href }) => (
          <NavLink
            key={label}
            to={href}
            className={({ isActive }) =>
              `flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
    hover:bg-[#e6f4ff] hover:text-[#0ea5e9] active:bg-[#bae6fd]
    ${isActive ? "bg-[#e6f4ff] text-[#0ea5e9] font-semibold" : "text-base-content/80"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Sidebar;
