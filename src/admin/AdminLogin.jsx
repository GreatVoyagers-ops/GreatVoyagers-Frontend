import { useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { Logo } from "../components/Navbar";
import PageLoader from "../components/PageLoader";
import { photos, unsplash } from "../lib/img";
import { useAuth } from "./AuthContext";

export default function AdminLogin() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const emailRef = useRef(null);

  if (status === "loading") return <PageLoader className="min-h-screen" />;
  if (status === "authed") return <Navigate to={location.state?.from || "/admin"} replace />;

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      emailRef.current?.focus();
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await login(email.trim(), password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (err) {
      setError(err.message);
      setPassword("");
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-ivory-100 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={unsplash(photos.krabiCliffs, 1400, 1800)} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-14 text-ivory-50">
          <p className="eyebrow text-terra-400">Admin panel</p>
          <p className="mt-4 max-w-md font-serif text-4xl leading-tight">
            Share the stories that bring travellers <em className="font-light text-terra-400">to you.</em>
          </p>
        </div>
      </div>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <Logo />
          <div className="mt-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-ink-900 text-ivory-50">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <h1 className="mt-6 font-serif text-4xl text-ink-900">Admin login</h1>
          <p className="mt-3 text-ink-600">Sign in to write, edit and publish blog posts.</p>

          <form onSubmit={onSubmit} noValidate className="mt-10 space-y-5">
            {error && (
              <p role="alert" className="flex items-start gap-3 rounded-xl bg-terra-500/10 px-4 py-3 text-sm font-semibold text-terra-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}
            <div>
              <label htmlFor="admin-email" className="mb-2 block text-sm font-bold text-ink-900">
                Email
              </label>
              <input
                ref={emailRef}
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="field"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-ink-900">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:text-ink-900"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full py-4 disabled:cursor-wait disabled:opacity-70">
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Signing in" : "Sign in"}
            </button>
          </form>

          <Link to="/" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to website
          </Link>
        </div>
      </main>
    </div>
  );
}
