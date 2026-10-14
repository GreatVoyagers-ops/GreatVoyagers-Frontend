import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarClock, Check, FileText, Mail, MessageCircle, Phone, StickyNote, Trash2, UserRound } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import QuotesCard from "./QuotesCard";
import { addNote, deleteEnquiry, deleteNote, getEnquiry, patchEnquiry, updateEnquiry } from "./crmApi";
import { ENQUIRY_SOURCES, ENQUIRY_STATUSES, LOST_REASONS } from "./constants";
import { TripFields } from "./EnquiryFields";
import {
  displayPhone,
  ErrorState,
  Field,
  FollowUpBadge,
  formatDate,
  formatDateTime,
  formatMonth,
  fromLocalInput,
  Notice,
  STATUS_STYLES,
  StatusPill,
  telHref,
  toLocalInput,
  useAction,
  useLoader,
  whatsappHref,
} from "./ui";

const toForm = (e) => ({
  name: e.name,
  phone: displayPhone(e.phone),
  email: e.email,
  destination: e.destination,
  tripType: e.tripType,
  travelMonth: e.travelMonth,
  duration: e.duration,
  adults: String(e.adults ?? 0),
  children: String(e.children ?? 0),
  budget: e.budget,
  message: e.message,
  source: e.source,
  quoteAmount: e.quoteAmount ?? "",
  bookedAmount: e.bookedAmount ?? "",
  lostReason: e.lostReason,
});

function templates(e) {
  const first = e.name.split(" ")[0];
  const trip = e.destination || "your trip";
  const month = e.travelMonth ? ` in ${formatMonth(e.travelMonth)}` : "";
  return [
    { label: "Greeting", text: `Hi ${first}, this is GreatVoyagers. Thank you for your enquiry about ${trip}${month}. When is a good time to discuss your plans?` },
    { label: "Quote sent", text: `Hi ${first}, we've shared the itinerary and quote for ${trip}. Please have a look and let us know if you'd like any changes.` },
    { label: "Follow-up", text: `Hi ${first}, just checking in on your ${trip} plans. Happy to help with any questions or hold the dates for you.` },
  ];
}

function quickDate(daysAhead, hour = 11) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const ACTIVITY_ICONS = { note: StickyNote, status: Check, followup: CalendarClock, created: UserRound, quote: FileText };

export default function EnquiryDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const run = useAction();
  const { status, data, error, reload } = useLoader((signal) => getEnquiry(id, signal), [id]);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(location.state?.notice ? { tone: "success", text: location.state.notice } : null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");

  const enquiry = data?.enquiry;

  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    if (!enquiry) return;
    setForm((current) => current ?? toForm(enquiry));
    setFollowUp(toLocalInput(enquiry.followUpAt));
  }, [enquiry]);

  useEffect(() => {
    if (notice?.tone !== "success") return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (status === "loading") return <PageLoader label="Loading enquiry" className="py-24" />;
  if (!enquiry || !form) return <div className="crm-card"><ErrorState message={error || "Enquiry not found."} onRetry={reload} /></div>;

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const quick = async (changes, text) => {
    setBusy(true);
    const result = await run(() => patchEnquiry(id, changes));
    setBusy(false);
    setNotice(result.ok ? { tone: "success", text } : { tone: "error", text: result.error.message });
    if (result.ok) reload();
  };

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    const result = await run(() => updateEnquiry(id, { ...form, status: enquiry.status, followUpAt: enquiry.followUpAt }));
    setSaving(false);
    if (!result.ok) {
      setErrors(result.error.fields || {});
      return setNotice({ tone: "error", text: result.error.message });
    }
    setForm(toForm(result.data.enquiry));
    setNotice({ tone: "success", text: "Changes saved." });
    reload();
  };

  const onNote = async (event) => {
    event.preventDefault();
    if (!note.trim()) return;
    setBusy(true);
    const result = await run(() => addNote(id, note));
    setBusy(false);
    if (!result.ok) return setNotice({ tone: "error", text: result.error.message });
    setNote("");
    reload();
  };

  const onDeleteNote = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;
    const result = await run(() => deleteNote(id, noteId));
    if (result.ok) reload();
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete enquiry #${enquiry.number} from ${enquiry.name}? This can't be undone.`)) return;
    const result = await run(() => deleteEnquiry(id));
    if (!result.ok) return setNotice({ tone: "error", text: result.error.message });
    navigate("/admin/enquiries", { replace: true });
  };

  const phone = enquiry.phone || enquiry.customer?.phones?.[0];
  const whatsapp = enquiry.customer?.whatsapp || phone;
  const email = enquiry.email || enquiry.customer?.email;
  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(enquiry));

  return (
    <>
      <Link to="/admin/enquiries" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Enquiries
      </Link>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-3xl text-ink-900 md:text-4xl">{enquiry.name}</h1>
            <StatusPill status={enquiry.status} />
          </div>
          <p className="mt-1.5 text-sm text-ink-600">
            #{enquiry.number} · {enquiry.source} · received {formatDateTime(enquiry.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {phone && (
            <a href={telHref(phone)} className="btn-sm">
              <Phone className="h-4 w-4" aria-hidden="true" /> Call {displayPhone(phone)}
            </a>
          )}
          {whatsapp && (
            <details className="relative">
              <summary className="btn-sm-ghost cursor-pointer list-none border-emerald-600/30! text-emerald-800! [&::-webkit-details-marker]:hidden">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
              </summary>
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-ink-900/10 bg-ivory-50 p-2 shadow-lg">
                {templates(enquiry).map((template) => (
                  <a key={template.label} href={whatsappHref(whatsapp, template.text)} target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 hover:bg-ivory-100">
                    <span className="block text-sm font-semibold text-ink-900">{template.label}</span>
                    <span className="line-clamp-2 block text-xs text-ink-600">{template.text}</span>
                  </a>
                ))}
                <a href={whatsappHref(whatsapp)} target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink-600 hover:bg-ivory-100">
                  Blank message
                </a>
              </div>
            </details>
          )}
          {email && (
            <a href={`mailto:${email}?subject=${encodeURIComponent(`Your ${enquiry.destination || "travel"} enquiry with GreatVoyagers`)}`} className="btn-sm-ghost">
              <Mail className="h-4 w-4" aria-hidden="true" /> Email
            </a>
          )}
        </div>
      </div>

      {notice && (
        <div className="mt-4">
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      )}

      <section className="crm-card mt-5 p-4" aria-label="Pipeline status">
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6">
          {ENQUIRY_STATUSES.map((s) => {
            const active = s === enquiry.status;
            return (
              <button
                key={s}
                type="button"
                disabled={busy || active}
                onClick={() => quick({ status: s }, `Status changed to ${s}.`)}
                aria-pressed={active}
                className={`rounded-xl px-2 py-2.5 text-sm font-bold transition-colors ${
                  active ? `${STATUS_STYLES[s].pill} ring-2 ring-ink-900/15` : "bg-ivory-100 text-ink-600 hover:bg-ivory-200 hover:text-ink-900"
                } disabled:cursor-default`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <form onSubmit={onSave} className="crm-card p-5" noValidate>
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-ink-900">Details</h2>
              <button type="submit" disabled={saving || !dirty} className="btn-sm">
                {saving ? "Saving…" : dirty ? "Save changes" : "Saved"}
              </button>
            </div>
            <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Name" htmlFor="f-name" error={errors.name}>
                <input id="f-name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} className="field-sm" />
              </Field>
              <Field label="Phone" htmlFor="f-phone" error={errors.phone}>
                <input id="f-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="field-sm" />
              </Field>
              <Field label="Email" htmlFor="f-email" error={errors.email}>
                <input id="f-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} aria-invalid={Boolean(errors.email)} className="field-sm" />
              </Field>
              <Field label="Source" htmlFor="f-source">
                <select id="f-source" value={form.source} onChange={(e) => set("source", e.target.value)} className="field-sm">
                  {ENQUIRY_SOURCES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>
            <TripFields values={form} set={set} errors={errors} />
            <div className="mt-4 grid gap-4 border-t border-ink-900/8 pt-4 sm:grid-cols-3">
              <Field label="Quote amount (₹)" htmlFor="f-quoteAmount" error={errors.quoteAmount}>
                <input id="f-quoteAmount" inputMode="numeric" value={form.quoteAmount} onChange={(e) => set("quoteAmount", e.target.value)} className="field-sm" />
              </Field>
              <Field label="Booked amount (₹)" htmlFor="f-bookedAmount" error={errors.bookedAmount} hint="Final value when won.">
                <input id="f-bookedAmount" inputMode="numeric" value={form.bookedAmount} onChange={(e) => set("bookedAmount", e.target.value)} className="field-sm" />
              </Field>
              <Field label="Lost reason" htmlFor="f-lostReason" error={errors.lostReason}>
                <input id="f-lostReason" list="crm-lost-reasons" value={form.lostReason} onChange={(e) => set("lostReason", e.target.value)} className="field-sm" placeholder={enquiry.status === "Lost" ? "Why was it lost?" : "Only if lost"} />
                <datalist id="crm-lost-reasons">
                  {LOST_REASONS.map((reason) => (
                    <option key={reason} value={reason} />
                  ))}
                </datalist>
              </Field>
            </div>
          </form>

          <section className="crm-card p-5">
            <h2 className="font-serif text-xl text-ink-900">Notes & timeline</h2>
            <form onSubmit={onNote} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
              <label className="flex-1">
                <span className="sr-only">Add a note</span>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onNote(e);
                  }}
                  placeholder="Log a call, what the customer said, next steps…"
                  className="field-sm resize-y"
                />
              </label>
              <button type="submit" disabled={busy || !note.trim()} className="btn-sm shrink-0">
                Add note
              </button>
            </form>
            <ol className="mt-5 space-y-0">
              {enquiry.activity.map((item, index) => {
                const Icon = ACTIVITY_ICONS[item.type] || StickyNote;
                const last = index === enquiry.activity.length - 1;
                return (
                  <li key={item._id} className="relative flex gap-3 pb-5">
                    {!last && <span className="absolute left-4 top-9 bottom-0 w-px bg-ink-900/10" aria-hidden="true" />}
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.type === "note" ? "bg-terra-500/12 text-terra-600" : "bg-ivory-200 text-ink-600"}`}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className={`whitespace-pre-wrap break-words text-sm ${item.type === "note" ? "text-ink-900" : "text-ink-600"}`}>{item.text}</p>
                      <p className="mt-0.5 text-xs text-ink-400">{formatDateTime(item.at)}</p>
                    </div>
                    {item.type === "note" && (
                      <button type="button" onClick={() => onDeleteNote(item._id)} className="h-8 w-8 shrink-0 rounded-full text-ink-400 hover:bg-terra-500/10 hover:text-terra-600" aria-label="Delete note">
                        <Trash2 className="mx-auto h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <aside className="space-y-4">
          <QuotesCard enquiryId={id} quotes={data.quotes || []} onError={(text) => setNotice({ tone: "error", text })} />

          <section className="crm-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl text-ink-900">Follow-up</h2>
              <FollowUpBadge value={enquiry.followUpAt} />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {[
                ["Tomorrow", 1],
                ["In 3 days", 3],
                ["Next week", 7],
              ].map(([label, days]) => (
                <button
                  key={label}
                  type="button"
                  disabled={busy}
                  onClick={() => quick({ followUpAt: quickDate(days).toISOString() }, `Follow-up set for ${formatDate(quickDate(days))}, 11 am.`)}
                  className="rounded-full bg-ivory-100 px-3 py-1.5 text-xs font-bold text-ink-600 hover:bg-ivory-200 hover:text-ink-900"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <label className="flex-1">
                <span className="sr-only">Follow-up date and time</span>
                <input type="datetime-local" value={followUp} onChange={(e) => setFollowUp(e.target.value)} className="field-sm" />
              </label>
              <button type="button" disabled={busy || !followUp || followUp === toLocalInput(enquiry.followUpAt)} onClick={() => quick({ followUpAt: fromLocalInput(followUp) }, "Follow-up updated.")} className="btn-sm shrink-0">
                Set
              </button>
            </div>
            {enquiry.followUpAt && (
              <button type="button" disabled={busy} onClick={() => quick({ followUpAt: null }, "Follow-up cleared.")} className="mt-2 text-xs font-semibold text-ink-400 hover:text-terra-600">
                Clear follow-up
              </button>
            )}
          </section>

          <section className="crm-card p-5">
            <h2 className="font-serif text-xl text-ink-900">Customer</h2>
            {enquiry.customer ? (
              <div className="mt-3 text-sm">
                <Link to={`/admin/customers/${enquiry.customer._id}`} className="font-semibold text-ink-900 hover:text-terra-600">
                  {enquiry.customer.name}
                </Link>
                <p className="mt-1 text-ink-600">{enquiry.customer.phones.map(displayPhone).join(", ") || "No phone"}</p>
                {enquiry.customer.email && <p className="text-ink-600">{enquiry.customer.email}</p>}
                {enquiry.customer.city && <p className="text-ink-600">{enquiry.customer.city}</p>}
                {enquiry.customer.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {enquiry.customer.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-ivory-200 px-2 py-0.5 text-xs font-semibold text-ink-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link to={`/admin/customers/${enquiry.customer._id}`} className="mt-3 inline-block text-xs font-semibold text-terra-600 hover:text-terra-500">
                  View all their enquiries →
                </Link>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-600">The linked customer was deleted. Contact details above are kept from the enquiry.</p>
            )}
          </section>

          <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 px-1 text-sm font-semibold text-ink-400 hover:text-terra-600">
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete enquiry
          </button>
        </aside>
      </div>
    </>
  );
}
