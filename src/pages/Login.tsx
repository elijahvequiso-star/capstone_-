import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-construction.jpg";
import { Eye, EyeOff } from "lucide-react";
import API_BASE from "@/lib/config";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
      } else {
        localStorage.setItem("user", JSON.stringify(data.user));
        const role = data.user.role;
        if (role === "admin" || role === "hr") {
          navigate("/dashboard");
        } else {
          navigate("/my-dashboard");
        }
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
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/70 to-black/80 backdrop-blur-[2px]" />
      </div>

      <PublicNavbar />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-20 sm:px-6">
        <div className="w-full max-w-md rounded-3xl bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 shadow-2xl shadow-black/50 p-8 sm:p-10 animate-fade-in-up">
          <h2 className="mb-2 text-center font-heading text-4xl font-extrabold tracking-tight text-white">Welcome Back</h2>
          <p className="mb-8 text-center text-sm text-gray-400">Sign in — your role is recognized automatically</p>

          {error && <div className="mb-4 rounded-xl bg-red-500/20 border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-5">
            <input required type="text" placeholder="Username" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })} className={inputClass} />

            <div className="relative">
              <input required type={showPassword ? "text" : "password"} placeholder="Password"
                value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 transition-colors">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 py-4 font-heading font-semibold text-white text-lg shadow-lg hover:from-amber-500 hover:to-amber-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">Create account</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
