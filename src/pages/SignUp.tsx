import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-construction.jpg";
import { CheckCircle2, Eye, EyeOff, FileBadge2, KeyRound, Phone, ShieldAlert } from "lucide-react";
import API_BASE from "@/lib/config";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20";

const getStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (score <= 1) return { label: "Weak", color: "bg-red-400", text: "text-red-300", width: "w-1/3" };
  if (score <= 3) return { label: "Medium", color: "bg-amber-400", text: "text-amber-200", width: "w-2/3" };
  return { label: "Strong", color: "bg-emerald-400", text: "text-emerald-300", width: "w-full" };
};

const SignUp = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ employee_id: "", mobile_number: "", password: "", confirm_password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const passwordMatches = form.confirm_password.length === 0 || form.password === form.confirm_password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (strength.label === "Weak") {
      setError("Please use a stronger password before creating your account.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Confirm password must match password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          employee_id: form.employee_id.trim().toUpperCase(),
          mobile_number: form.mobile_number.trim(),
          username: form.employee_id.trim().toUpperCase(),
        }),
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f]">
      <div className="absolute inset-0">
        <img src={heroImg} alt="Construction site" className="h-full w-full scale-105 object-cover opacity-65" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(245,158,11,0.22),transparent_30%),linear-gradient(135deg,rgba(7,17,31,0.9),rgba(15,23,42,0.96))]" />
      </div>

      <PublicNavbar />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-24">
        <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[430px_1fr] lg:items-start">
          <aside className="rounded-[28px] border border-white/10 bg-slate-900/65 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-white">Before You Register</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              You need a valid Employee ID provided by HR. Your name and role are loaded from HR records after activation.
            </p>

            <div className="mt-7 space-y-4">
              {[
                { title: "Enter HR-issued ID", icon: KeyRound },
                { title: "Create Password", icon: FileBadge2 },
                { title: "Access Dashboard", icon: CheckCircle2 },
              ].map((step, index) => (
                <div key={step.title} className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-300/10 text-amber-200">
                    <step.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-200">Step {index + 1}</p>
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/10 bg-slate-900/75 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Employee Management Registration</p>
              <h1 className="mt-2 font-heading text-3xl font-extrabold text-white">Create Account</h1>
              <p className="mt-2 text-sm text-slate-400">Registration only works after HR pre-registers your Employee ID.</p>
            </div>

            {error && <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Employee ID</label>
                <input required type="text" placeholder="Provided by HR department" value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className={inputClass} />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Mobile Number</label>
                <div className="relative">
                  <input required type="tel" placeholder="Used for authentication / verification" value={form.mobile_number}
                    onChange={(e) => setForm({ ...form, mobile_number: e.target.value })} className={`${inputClass} pr-12`} />
                  <Phone className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Password</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} placeholder="Create password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-300">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className={`h-full rounded-full ${strength.color} ${strength.width} transition-all`} />
                  </div>
                  <p className={`mt-1 text-xs font-semibold ${strength.text}`}>{strength.label}</p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">Confirm Password</label>
                <div className="relative">
                  <input required type={showConfirm ? "text" : "password"} placeholder="Must match password" value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} className={`${inputClass} pr-12 ${passwordMatches ? "" : "border-red-400/60"}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-300">
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {!passwordMatches && <p className="mt-2 text-xs font-semibold text-red-300">Passwords must match.</p>}
              </div>

              <div className="sm:col-span-2">
                <button type="submit" disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 font-heading text-base font-bold text-white shadow-lg shadow-orange-950/40 transition hover:brightness-110 disabled:opacity-60">
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            </form>

            <div className="mt-7 text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-amber-300 transition hover:text-amber-200">Sign in</Link>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SignUp;
