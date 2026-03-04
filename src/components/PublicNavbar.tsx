import { Link, useLocation } from "react-router-dom";
import { HardHat } from "lucide-react";

const PublicNavbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

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
        <Link
          to="/login"
          className="ml-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:brightness-110"
        >
          Log In
        </Link>
      </div>
    </nav>
  );
};

export default PublicNavbar;
