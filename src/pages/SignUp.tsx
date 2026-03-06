import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import heroImg from "@/assets/hero-construction.jpg";
import { Eye, EyeOff } from "lucide-react";

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your signup logic here (e.g. API call, validation)
    console.log("Sign up submitted");
    // Example: navigate("/dashboard") after success
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      {/* Background – subtle zoom + strong gradient overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Modern construction skyline at golden hour"
          className="h-full w-full object-cover opacity-85 scale-105 transition-transform duration-[25s]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/75 to-black/85 backdrop-blur-[2px]" />
      </div>

      <PublicNavbar />

      {/* Signup Card – glassmorphism with depth */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20 sm:px-6">
        <div
          className={`
            w-full max-w-md transform transition-all duration-700
            rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-700/50
            shadow-2xl shadow-black/60 p-8 sm:p-10
            animate-fade-in-up
          `}
        >
          <h2 className="mb-8 text-center font-heading text-4xl font-extrabold tracking-tight text-white">
            Create Your Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <input
              type="text"
              placeholder="Full Name"
              className={`
                w-full rounded-xl border border-gray-600/50 bg-gray-800/40 
                px-5 py-4 text-white placeholder:text-gray-400
                focus:border-amber-600/70 focus:ring-2 focus:ring-amber-500/30
                transition-all duration-300 outline-none
              `}
            />

            {/* Role Selector – custom styled */}
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
                <option value="admin">Administrator</option>
                <option value="employee">Team Member</option>
              </select>
              {/* Custom dropdown icon */}
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

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create Password"
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

            {/* Submit Button */}
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
              Create Account
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-8 text-center text-sm text-gray-400 space-y-3">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                Sign in
              </Link>
            </p>
            <Link
              to="/"
              className="block hover:text-amber-400 transition-colors"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Subtle footer branding */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-gray-500 text-sm pointer-events-none">
        VEQUISO • Excellence in Construction
      </div>
    </div>
  );
};

export default SignUp;