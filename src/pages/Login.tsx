import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";
import heroImg from "@/assets/hero-construction.jpg";
import { Eye, EyeOff, FileUp, LockKeyhole } from "lucide-react";
import API_BASE from "@/lib/config";

const inputClass =
  "w-full rounded-2xl border border-white/10 bg-slate-950/60 px-5 py-4 text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/70 focus:ring-2 focus:ring-amber-400/20";

const getLoginName = (value: string) => value.trim();

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ employee_id: "", password: "" });
  const [pendingUser, setPendingUser] = useState<any | null>(null);
  const [identityFile, setIdentityFile] = useState<File | null>(null);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotForm, setForgotForm] = useState({ employee_id: "", mobile_number: "", new_password: "", confirm_password: "" });
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const routeUser = (user: any) => {
    localStorage.setItem("user", JSON.stringify(user));
    if (user.role === "admin" || user.role === "hr") navigate("/dashboard");
    else navigate("/my-dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    const loginName = getLoginName(form.employee_id);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: loginName,
          username: loginName,
          password: form.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "Login failed.");
      } else if (data.requires_identity_verification) {
        setPendingUser(data.user);
        setNotice("Verify your real ID before entering the employee dashboard.");
      } else {
        routeUser(data.user);
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!identityFile || !pendingUser?.employee_id) {
      setError("Please upload a clear photo or PDF of your real ID.");
      return;
    }

    const body = new FormData();
    body.append("employee_id", pendingUser.employee_id);
    body.append("identity_file", identityFile);

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/verify-identity/`, { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Identity verification failed.");
      } else {
        routeUser(data.user);
      }
    } catch {
      setError("Cannot connect to server. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee_id: forgotForm.employee_id.trim().toUpperCase(),
          mobile_number: forgotForm.mobile_number.trim(),
          new_password: forgotForm.new_password,
          confirm_password: forgotForm.confirm_password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setError(data.error || "Password reset is not available on this server yet. Please deploy the latest backend update.");
      else {
        setNotice(data.message);
        setForgotOpen(false);
        setForgotForm({ employee_id: "", mobile_number: "", new_password: "", confirm_password: "" });
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
        <img src={heroImg} alt="Construction team" className="h-full w-full scale-105 object-cover opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.2),transparent_28%),linear-gradient(135deg,rgba(7,17,31,0.88),rgba(11,18,32,0.94)_50%,rgba(15,23,42,0.96))]" />
      </div>

      <PublicNavbar />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 py-24">
        <div className="w-full max-w-md">
          <section className="rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-lg shadow-orange-950/40">
                {pendingUser ? <FileUp className="h-5 w-5" /> : <LockKeyhole className="h-5 w-5" />}
              </div>
              <h2 className="font-heading text-3xl font-extrabold text-white">
                {pendingUser ? "Verify Your Identity" : "Welcome Back"}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                {pendingUser ? "Upload your real ID to activate access." : "Use your HR-issued Employee ID."}
              </p>
            </div>

            {error && <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            {notice && <div className="mb-4 rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">{notice}</div>}

            {pendingUser ? (
              <form onSubmit={handleVerifyIdentity} className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-sm font-semibold text-white">{pendingUser.full_name}</p>
                  <p className="mt-1 text-xs text-slate-400">{pendingUser.employee_id}</p>
                </div>
                <label className="block cursor-pointer rounded-2xl border border-dashed border-amber-300/40 bg-amber-300/10 px-5 py-6 text-center transition hover:bg-amber-300/15">
                  <FileUp className="mx-auto mb-2 h-6 w-6 text-amber-200" />
                  <span className="block text-sm font-semibold text-white">{identityFile ? identityFile.name : "Upload real ID"}</span>
                  <span className="mt-1 block text-xs text-slate-400">PNG, JPG, or PDF</span>
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setIdentityFile(e.target.files?.[0] || null)} />
                </label>
                <button type="submit" disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 font-heading text-base font-bold text-white shadow-lg shadow-orange-950/40 transition hover:brightness-110 disabled:opacity-60">
                  {loading ? "Verifying..." : "Verify and Continue"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-5">
                <input required type="text" placeholder="Employee ID or admin username" value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })} className={inputClass} />

                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} placeholder="Password"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`${inputClass} pr-12`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-300">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <Link to="/signup" className="font-semibold text-amber-300 transition hover:text-amber-200">Create account</Link>
                  <button type="button" onClick={() => setForgotOpen(true)} className="font-semibold text-slate-300 transition hover:text-white">
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-4 font-heading text-base font-bold text-white shadow-lg shadow-orange-950/40 transition hover:brightness-110 disabled:opacity-60">
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>

      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setForgotOpen(false)}>
          <form onSubmit={handleForgot} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#101827] p-6 shadow-2xl">
            <h3 className="text-xl font-extrabold text-white">Forgot Password</h3>
            <p className="mt-2 text-sm text-slate-400">Verify your Employee ID and mobile number, then set a new password.</p>
            <div className="mt-5 space-y-4">
              <input required value={forgotForm.employee_id} onChange={(e) => setForgotForm({ ...forgotForm, employee_id: e.target.value })}
                className={inputClass} placeholder="Employee ID" />
              <input required value={forgotForm.mobile_number} onChange={(e) => setForgotForm({ ...forgotForm, mobile_number: e.target.value })}
                className={inputClass} placeholder="Mobile Number" />
              <div className="relative">
                <input required type={showResetPassword ? "text" : "password"} value={forgotForm.new_password}
                  onChange={(e) => setForgotForm({ ...forgotForm, new_password: e.target.value })}
                  className={`${inputClass} pr-12`} placeholder="New Password" />
                <button type="button" onClick={() => setShowResetPassword(!showResetPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-300">
                  {showResetPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="relative">
                <input required type={showResetConfirm ? "text" : "password"} value={forgotForm.confirm_password}
                  onChange={(e) => setForgotForm({ ...forgotForm, confirm_password: e.target.value })}
                  className={`${inputClass} pr-12`} placeholder="Confirm New Password" />
                <button type="button" onClick={() => setShowResetConfirm(!showResetConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-amber-300">
                  {showResetConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button disabled={loading} className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 py-3 text-sm font-bold text-white disabled:opacity-60">Submit</button>
              <button type="button" onClick={() => setForgotOpen(false)} className="flex-1 rounded-2xl border border-white/10 py-3 text-sm font-bold text-slate-300">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Login;
