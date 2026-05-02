import { Link, useLocation } from "react-router-dom";
import { HardHat, UserCircle2 } from "lucide-react";

type StoredUser = {
  full_name?: string;
  username?: string;
  role?: string;
};

const PublicNavbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null") as StoredUser | null;
    } catch {
      return null;
    }
  })();
  const displayName = user?.full_name || user?.username || "My Account";
  const dashboardPath = user?.role === "admin" || user?.role === "hr" ? "/dashboard" : "/my-dashboard";

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
      <Link to="/" className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <HardHat className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-heading text-lg font-bold text-primary-foreground">VEQUISO</span>
      </Link>
      <div className="flex items-center gap-1">
        {[
          { label: "Home", path: "/" },
          { label: "About", path: "/about" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              isActive(item.path)
                ? "bg-primary/20 text-primary-foreground"
                : "text-primary-foreground/80 hover:text-primary-foreground"
            }`}
          >
            {item.label}
          </Link>
        ))}
        {user ? (
          <Link
            to={dashboardPath}
            className="ml-2 flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-primary-foreground shadow-md backdrop-blur-md transition-all hover:bg-white/15"
          >
            <UserCircle2 className="h-5 w-5 shrink-0" />
            <span className="max-w-[180px] truncate font-semibold">{displayName}</span>
          </Link>
        ) : (
          <Link
            to="/login"
            className="ml-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:brightness-110"
          >
            Log In
          </Link>
        )}
      </div>
    </nav>
  );
};

export default PublicNavbar;
