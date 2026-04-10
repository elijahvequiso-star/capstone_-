import { HardHat } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="sticky bottom-0 z-50 w-full border-t border-gray-800 bg-gray-950 px-6 py-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-600">
            <HardHat className="h-4 w-4 text-white" />
          </div>
          <span className="font-heading font-bold text-white">VEQUISO</span>
        </div>

        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} VEQUISO Construction. All rights reserved.
        </p>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-amber-400 transition-colors">About</Link>
          <Link to="/login" className="hover:text-amber-400 transition-colors">Login</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
