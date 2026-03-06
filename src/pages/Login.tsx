import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import heroImg from "@/assets/hero-construction.jpg";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Add real auth logic here later
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Background with refined overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Modern construction skyline at dusk"
          className="h-full w-full object-cover opacity-85 scale-105 transition-transform duration-[20s]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/80 backdrop-blur-[2px]" />
      </div>

      <PublicNavbar />

      {/* Login Card – centered with glass effect */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20 sm:px-6">
        <div
          className={`
            w-full max-w-md transform transition-all duration-700
            rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-700/50
            shadow-2xl shadow-black/50 p-8 sm:p-10
            animate-fade-in-up
          `}
        >
          <h2 className="mb-8 text-center font-heading text-4xl font-extrabold tracking-tight text-white">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selector – styled like input */}
            <div className="relative">
              <select
                defaultValue=""
                className={`
                  w-full appearance-none rounded-xl border border-gray-600/50 
                  bg-gray-800/40 px-5 py-4 text-white placeholder:text-gray-400
                  focus:border-amber-600/70 focus:ring-2 focus:ring-amber-500/30
                  transition-all duration-300 outline-none
                `}
              >
                <option value="" disabled className="text-gray-500">
                  Select your role
                </option>
                <option value="admin">Mason</option>
                <option value="admin">Electrician</option>
                <option value="employee">Team Member</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Username / Email */}
            <input
              type="text"
              placeholder="Username or Email"
              className={`
                w-full rounded-xl border border-gray-600/50 bg-gray-800/40 
                px-5 py-4 text-white placeholder:text-gray-400
                focus:border-amber-600/70 focus:ring-2 focus:ring-amber-500/30
                transition-all duration-300 outline-none
              `}
            />

            {/* Password with toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`
                  w-full rounded-xl border border-gray-600/50 bg-gray-800/40 
                  px-5 py-4 text-white placeholder:text-gray-400 pr-12
                  focus:border-amber-600/70 focus:ring-2 focus:ring-amber-500/30
                  transition-all duration-300 outline-none
                `}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Submit Button – gradient + lift */}
            <button
              type="submit"
              className={`
                w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 
                py-4 font-heading font-semibold text-white text-lg
                shadow-lg shadow-amber-900/30 hover:shadow-amber-900/50
                hover:from-amber-500 hover:to-amber-600
                transform hover:scale-[1.02] active:scale-[0.98]
                transition-all duration-300
              `}
            >
              Sign In
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center text-sm text-gray-400 space-y-3">
            <Link
              to="/forgot-password" // Add this route if needed
              className="block hover:text-amber-400 transition-colors"
            >
              Forgot password?
            </Link>
            <p>
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Optional subtle CTA / branding at bottom */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-gray-500 text-sm pointer-events-none">
        VEQUISO • Building Excellence
      </div>
    </div>
  );
};

export default Login;