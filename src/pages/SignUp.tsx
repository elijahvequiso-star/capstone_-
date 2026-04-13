import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-construction.jpg";
import { Eye, EyeOff } from "lucide-react";
import API_BASE from "@/lib/config";

const ROLES = [
  { value: "mason", label: "Mason" },
  { value: "electrician", label: "Electrician" },
  { value: "driver", label: "Driver" },
  { value: "foreman", label: "Foreman" },
];

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ full_name: "", role: "", username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.role) { setError("Please select a role."); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
      } else {
        navigate("/login");
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-gray-600/50 bg-gray-800/40 px-5 py-4 text-white placeholder:text-gray-400 focus:border-amber-600/70 focus:ring-2 focus:ring-amber-500/30 transition-all duration-300 outline-none";

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-950">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Construction" className="h-full w-full object-cover opacity-85 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-br from-black/65 via-black/75 to-black/85 backdrop-blur-[2px]" />
      </div>

      <PublicNavbar />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20 sm:px-6">
        <div className="w-full max-w-md rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/60 p-8 sm:p-10 animate-fade-in-up">
          <h2 className="mb-2 text-center font-heading text-4xl font-extrabold tracking-tight text-white">
            Create Your Account
          </h2>
          <p className="mb-8 text-center text-sm text-gray-400">Fill in your details to get started</p>

          {error && (
            <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input required type="text" placeholder="Full Name" value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} />

            <div className="relative">
              <select required value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                className={`${inputClass} appearance-none`}>
                <option value="" disabled className="text-gray-500">Select your role</option>
                {ROLES.map((r) => <option key={r.value} value={r.value} className="text-black">{r.label}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            <input required type="text" placeholder="Username" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputClass} />

            <div className="relative">
              <input required type={showPassword ? "text" : "password"} placeholder="Create Password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-4 font-heading font-semibold text-white text-lg shadow-lg hover:from-amber-500 hover:to-amber-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">Sign in</Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-gray-500 text-sm pointer-events-none">
        VEQUISO • Excellence in Construction
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
