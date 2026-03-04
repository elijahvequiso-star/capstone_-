import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import heroImg from "@/assets/hero-construction.jpg";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Construction site" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>
      <PublicNavbar />

      <div className="relative flex min-h-screen items-center justify-center px-4 pt-20">
        <div className="w-full max-w-md animate-fade-in overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-orange-dark p-8 shadow-2xl">
          <h2 className="mb-6 text-center font-heading text-3xl font-bold text-primary-foreground">Sign Up</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              className="w-full rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
            />
            <select className="w-full rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-primary-foreground focus:outline-none focus:ring-2 focus:ring-primary-foreground/40">
              <option value="" className="text-foreground">Select Role</option>
              <option value="admin" className="text-foreground">Admin</option>
              <option value="employee" className="text-foreground">Employee</option>
            </select>
            <input
              type="text"
              placeholder="Username"
              className="w-full rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-3 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/40"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/60">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button type="submit" className="w-full rounded-lg bg-primary-foreground py-3 font-heading font-bold text-primary shadow-md transition-all hover:scale-[1.02]">
              Sign Up
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-primary-foreground/80">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-foreground underline">Log In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
