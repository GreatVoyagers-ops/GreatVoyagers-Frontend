import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Mail, MessageCircle, Phone, RefreshCw, Search } from "lucide-react";
import { useAuth } from "../AuthContext";

/* ---------- formatting ---------- */

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const formatINR = (value) => (value === null || value === undefined || value === "" ? "—" : inr.format(value));

export const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";

export function formatMonth(value) {
  if (!/^\d{4}-\d{2}$/.test(value || "")) return "Flexible";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function displayPhone(phone) {
  if (!phone) return "";
  const match = /^\+91(\d{5})(\d{5})$/.exec(phone);
  return match ? `+91 ${match[1]} ${match[2]}` : phone;
}

const dayDiff = (date) => {
  const start = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(new Date(date)) - start(new Date())) / 86400000);
};

/** "Overdue 3d", "Today 4:30 pm", "Tomorrow", "In 5 days". */
export function followUpLabel(value) {
  if (!value) return null;
  const diff = dayDiff(value);
  const time = new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  if (diff < 0) return { text: `Overdue ${-diff}d`, tone: "overdue" };
  if (diff === 0) return { text: `Today ${time}`, tone: "today" };
  if (diff === 1) return { text: `Tomorrow ${time}`, tone: "soon" };
  return { text: diff < 7 ? `In ${diff} days` : formatDate(value), tone: "later" };
}

const pad = (n) => String(n).padStart(2, "0");
export const toLocalInput = (value) => {
  if (!value) return "";
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
export const fromLocalInput = (value) => (value ? new Date(value).toISOString() : null);

/* ---------- contact links ---------- */

export const telHref = (phone) => `tel:${String(phone).replace(/[^\d+]/g, "")}`;
export const whatsappHref = (phone, text = "") => {
  const digits = String(phone).replace(/\D/g, "");
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
};

const actionClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-ink-900/10 bg-ivory-50 text-ink-600 transition-colors hover:border-ink-900 hover:text-ink-900";

export function ContactActions({ phone, whatsapp, email, greeting = "", subject = "", size = "md" }) {
  const wa = whatsapp || phone;
  const cls = size === "sm" ? actionClass.replace("h-9 w-9", "h-8 w-8") : actionClass;
  return (
    <span className="inline-flex items-center gap-1.5">
      {phone && (
        <a href={telHref(phone)} className={cls} aria-label={`Call ${displayPhone(phone)}`} title={`Call ${displayPhone(phone)}`}>
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      {wa && (
        <a
          href={whatsappHref(wa, greeting)}
          target="_blank"
          rel="noreferrer"
          className={`${cls} hover:border-emerald-600! hover:text-emerald-700!`}
          aria-label="WhatsApp"
          title="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`}
          className={cls}
          aria-label={`Email ${email}`}
          title={email}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </span>
  );
}

/* ---------- status ---------- */

export const STATUS_STYLES = {
  New: { pill: "bg-sky-100 text-sky-800", dot: "bg-sky-500", bar: "bg-sky-500" },
  Contacted: { pill: "bg-violet-100 text-violet-800", dot: "bg-violet-500", bar: "bg-violet-500" },
  Quoted: { pill: "bg-amber-100 text-amber-800", dot: "bg-amber-500", bar: "bg-amber-500" },
  "Follow-up": { pill: "bg-orange-100 text-orange-800", dot: "bg-orange-500", bar: "bg-orange-500" },
  Won: { pill: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", bar: "bg-emerald-500" },
  Lost: { pill: "bg-ink-900/8 text-ink-600", dot: "bg-ink-400", bar: "bg-ink-400" },
};

export function StatusPill({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Lost;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${style.pill}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

const FOLLOW_UP_TONES = {
  overdue: "bg-terra-500/12 text-terra-600",
  today: "bg-amber-100 text-amber-800",
  soon: "bg-sea-100 text-sea-500",
  later: "bg-ivory-200 text-ink-600",
};

export function FollowUpBadge({ value }) {
  const label = followUpLabel(value);
  if (!label) return <span className="text-ink-400">—</span>;
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${FOLLOW_UP_TONES[label.tone]}`}>{label.text}</span>;
}

/* ---------- layout pieces ---------- */

export function PageHeader({ title, description, actions, back }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back}
        <h1 className="font-serif text-3xl text-ink-900 md:text-4xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder, className = "" }) {
  const [draft, setDraft] = useState(value);
  const latest = useRef(onChange);
  latest.current = onChange;

  useEffect(() => setDraft(value), [value]);
  useEffect(() => {
    if (draft === value) return;
    const timer = window.setTimeout(() => latest.current(draft), 300);
    return () => window.clearTimeout(timer);
  }, [draft, value]);

  return (
    <label className={`relative block ${className}`}>
      <span className="sr-only">{placeholder}</span>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
      <input type="search" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={placeholder} className="field-sm pl-9" />
    </label>
  );
}

export function Pagination({ page, pages, total, onChange, noun = "results" }) {
  if (!total) return null;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-ink-900/8 px-4 py-3 text-sm text-ink-600">
      <span>
        {total.toLocaleString("en-IN")} {noun}
      </span>
      {pages > 1 && (
        <div className="flex items-center gap-2">
          <button type="button" className="btn-sm-ghost px-2.5!" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="tabular-nums">
            {page} / {pages}
          </span>
          <button type="button" className="btn-sm-ghost px-2.5!" disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-4 py-16 text-center">
      <AlertCircle className="h-6 w-6 text-terra-500" aria-hidden="true" />
      <p className="font-semibold text-ink-900">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-sm-ghost">
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, children, action }) {
  return (
    <div className="px-4 py-16 text-center">
      <p className="font-serif text-2xl text-ink-900">{title}</p>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">{children}</p>}
      {action && <div className="mt-5 flex justify-center gap-2">{action}</div>}
    </div>
  );
}

export function Field({ label, error, hint, className = "", children, htmlFor }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="crm-label">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs font-semibold text-terra-600">{error}</p> : hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </div>
  );
}

export function Notice({ tone = "success", children }) {
  const tones = { success: "bg-sea-100 text-sea-500", error: "bg-terra-500/10 text-terra-600" };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm font-semibold ${tones[tone]}`}>
      {children}
    </p>
  );
}

/* ---------- data loading ---------- */

/** Loads data with abort-on-change and sends the user to login when the session expires. */
export function useLoader(load, deps) {
  const { expire } = useAuth();
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, status: current.data ? "refreshing" : "loading", error: "" }));
    load(controller.signal)
      .then((data) => setState({ status: "ready", data, error: "" }))
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (error.status === 401) return expire();
        setState((current) => ({ ...current, status: "error", error: error.message }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version, expire]);

  const reload = useCallback(() => setVersion((n) => n + 1), []);
  const setData = useCallback((update) => setState((current) => ({ ...current, data: typeof update === "function" ? update(current.data) : update })), []);
  return { ...state, reload, setData };
}

/** Wraps an async action so 401s log out and other errors come back as a message. */
export function useAction() {
  const { expire } = useAuth();
  return useCallback(
    async (fn) => {
      try {
        return { ok: true, data: await fn() };
      } catch (error) {
        if (error.status === 401) {
          expire();
          return { ok: false, error };
        }
        return { ok: false, error };
      }
    },
    [expire],
  );
}
