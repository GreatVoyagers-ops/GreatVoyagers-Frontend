import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Copy, Download, ExternalLink, ImagePlus, Link2, Mail, MessageCircle, Plus, Trash2, X } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { computeTotals, toNumber } from "../../lib/quoteTotals";
import { downloadQuotePdf } from "../../quote/downloadQuotePdf";
import { companyFromSettings, photoPicks, quoteRef, shareMessage, shareUrl, sizedImage } from "../../quote/quoteFormat";
import { deleteQuote, duplicateQuote, getQuote, getSettings, markQuoteSent, updateQuote } from "./crmApi";
import { QuoteStatus } from "./QuotesCard";
import { ErrorState, Field, formatDateTime, formatINR, Notice, useAction, useLoader, whatsappHref } from "./ui";

const MEAL_PLANS = ["Breakfast", "Breakfast & dinner", "All meals", "All inclusive", "Room only"];

const dateInput = (value) => (value ? new Date(value).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) : "");
const istDate = (value) => (value ? `${value}T00:00:00+05:30` : null);
const str = (value) => (value === undefined || value === null ? "" : String(value));

const toForm = (q) => ({
  title: q.title,
  customerName: q.customerName,
  destination: q.destination,
  startDate: dateInput(q.startDate),
  validUntil: dateInput(q.validUntil),
  nights: str(q.nights),
  adults: str(q.adults),
  children: str(q.children),
  coverImage: q.coverImage,
  days: q.days.map((d) => ({ title: d.title, description: d.description, image: d.image })),
  hotels: q.hotels.map((h) => ({ city: h.city, name: h.name, roomType: h.roomType, nights: str(h.nights), mealPlan: h.mealPlan })),
  inclusions: q.inclusions.join("\n"),
  exclusions: q.exclusions.join("\n"),
  notes: q.notes,
  terms: q.terms,
  pricing: {
    perAdult: q.pricing.perAdult ? str(q.pricing.perAdult) : "",
    perChild: q.pricing.perChild ? str(q.pricing.perChild) : "",
    gstPercent: str(q.pricing.gstPercent),
    tcsPercent: str(q.pricing.tcsPercent),
  },
});

const toPayload = (form) => ({ ...form, startDate: istDate(form.startDate), validUntil: istDate(form.validUntil) });

const emptyDay = () => ({ title: "", description: "", image: "" });
const emptyHotel = () => ({ city: "", name: "", roomType: "", nights: "", mealPlan: "Breakfast" });

function ImageField({ id, label, value, onChange, error }) {
  const [open, setOpen] = useState(false);
  return (
    <Field label={label} htmlFor={id} error={error} hint={!error && "Paste an https:// image link or pick one."}>
      <div className="flex gap-2">
        {value && <img src={sizedImage(value, 96, 72)} alt="" className="h-9 w-12 shrink-0 rounded-md bg-ivory-200 object-cover" />}
        <input id={id} value={value} onChange={(e) => onChange(e.target.value.trim())} placeholder="https://images.unsplash.com/…" className="field-sm min-w-0 flex-1" aria-invalid={Boolean(error)} />
        <button type="button" onClick={() => setOpen((v) => !v)} className="btn-sm-ghost shrink-0" aria-expanded={open}>
          <ImagePlus className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Pick</span>
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-ivory-100 hover:text-terra-600" aria-label="Remove photo">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      {open && (
        <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-ink-900/10 bg-ivory-50 p-2 sm:grid-cols-6">
          {photoPicks.map((pick) => (
            <button
              key={pick.url}
              type="button"
              onClick={() => {
                onChange(pick.url);
                setOpen(false);
              }}
              className={`group relative overflow-hidden rounded-lg ring-2 ${value === pick.url ? "ring-terra-500" : "ring-transparent hover:ring-ink-900/20"}`}
            >
              <img src={sizedImage(pick.url, 160, 110)} alt="" loading="lazy" className="aspect-[3/2] w-full object-cover" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-950/80 to-transparent px-1.5 pb-1 pt-3 text-left text-[0.65rem] font-semibold text-ivory-50">{pick.label}</span>
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}

function Section({ title, description, actions, children }) {
  return (
    <section className="crm-card p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl text-ink-900">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-ink-600">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function PriceRow({ label, value, strong }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 py-1.5 ${strong ? "border-t border-ink-900/10 pt-3 text-base font-bold text-ink-900" : "text-sm text-ink-600"}`}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export default function QuoteEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const run = useAction();
  const { status, data, error, reload, setData } = useLoader((signal) => getQuote(id, signal), [id]);
  const settings = useLoader((signal) => getSettings(signal), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState("");

  const quote = data?.quote;

  useEffect(() => {
    if (quote) setForm((current) => current ?? toForm(quote));
  }, [quote]);

  const dirty = Boolean(form && quote) && JSON.stringify(form) !== JSON.stringify(toForm(quote));

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => {
    if (notice?.tone !== "success") return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const totals = useMemo(() => (form ? computeTotals(form) : null), [form]);

  if (status === "loading") return <PageLoader label="Loading quote" className="py-24" />;
  if (!quote || !form) return <div className="crm-card"><ErrorState message={error || "Quote not found."} onRetry={reload} /></div>;

  const enquiry = quote.enquiry;
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const setPricing = (key, value) => {
    setForm((current) => ({ ...current, pricing: { ...current.pricing, [key]: value } }));
    setErrors((current) => ({ ...current, [`pricing.${key}`]: undefined }));
  };
  const setItem = (list, index, key, value) => {
    setForm((current) => ({ ...current, [list]: current[list].map((item, i) => (i === index ? { ...item, [key]: value } : item)) }));
    setErrors((current) => ({ ...current, [`${list}.${index}.${key}`]: undefined }));
  };
  const addItem = (list, item) => setForm((current) => ({ ...current, [list]: [...current[list], item] }));
  const removeItem = (list, index) => setForm((current) => ({ ...current, [list]: current[list].filter((_, i) => i !== index) }));
  const moveItem = (list, index, delta) =>
    setForm((current) => {
      const items = [...current[list]];
      const target = index + delta;
      if (target < 0 || target >= items.length) return current;
      [items[index], items[target]] = [items[target], items[index]];
      return { ...current, [list]: items };
    });

  const onSave = async (event) => {
    event?.preventDefault();
    setSaving(true);
    const result = await run(() => updateQuote(id, toPayload(form)));
    setSaving(false);
    if (!result.ok) {
      setErrors(result.error.fields || {});
      return setNotice({ tone: "error", text: result.error.message });
    }
    setErrors({});
    setData((current) => ({ ...current, quote: { ...result.data.quote, enquiry } }));
    setForm(toForm(result.data.quote));
    setNotice({ tone: "success", text: "Quote saved." });
  };

  const onSent = async (channel) => {
    const result = await run(() => markQuoteSent(id, channel));
    if (result.ok) setData((current) => ({ ...current, quote: { ...current.quote, status: result.data.quote.status, sentAt: result.data.quote.sentAt } }));
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl(quote.shareToken));
      setNotice({ tone: "success", text: "Link copied. Paste it into WhatsApp, SMS or email." });
      onSent("Link");
    } catch {
      setNotice({ tone: "error", text: `Couldn't copy automatically. The link is ${shareUrl(quote.shareToken)}` });
    }
  };

  const onDownload = async () => {
    setBusy("pdf");
    try {
      const company = settings.data ? companyFromSettings(settings.data.settings) : null;
      await downloadQuotePdf(quote, company);
    } catch (err) {
      setNotice({ tone: "error", text: `Couldn't create the PDF. ${err.message || ""}`.trim() });
    }
    setBusy("");
  };

  const onDuplicate = async () => {
    setBusy("duplicate");
    const result = await run(() => duplicateQuote(id));
    setBusy("");
    if (!result.ok) return setNotice({ tone: "error", text: result.error.message });
    navigate(`/admin/quotes/${result.data.quote._id}`);
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete ${quoteRef(quote)}? Anyone with the link will no longer be able to open it.`)) return;
    const result = await run(() => deleteQuote(id));
    if (!result.ok) return setNotice({ tone: "error", text: result.error.message });
    navigate(enquiry ? `/admin/enquiries/${enquiry._id}` : "/admin/enquiries", { replace: true });
  };

  const message = shareMessage(quote);
  const shareDisabled = dirty || saving;

  return (
    <form onSubmit={onSave} noValidate>
      {enquiry ? (
        <Link to={`/admin/enquiries/${enquiry._id}`} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {enquiry.name} · #{enquiry.number}
        </Link>
      ) : (
        <Link to="/admin/enquiries" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Enquiries
        </Link>
      )}

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl text-ink-900 md:text-4xl">{quoteRef(quote)}</h1>
          <QuoteStatus status={quote.status} />
        </div>
        <p className="text-sm text-ink-600">
          {quote.viewedAt
            ? `Customer opened it ${formatDateTime(quote.viewedAt)}${quote.viewCount > 1 ? ` · ${quote.viewCount} views` : ""}`
            : quote.sentAt
              ? `Sent ${formatDateTime(quote.sentAt)} · not opened yet`
              : `Draft · last saved ${formatDateTime(quote.updatedAt)}`}
        </p>
      </div>

      {notice && (
        <div className="mt-4">
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      )}

      <div className="mt-5 grid items-start gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Section title="Overview">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" htmlFor="q-title" error={errors.title} className="sm:col-span-2">
                <input id="q-title" value={form.title} onChange={(e) => set("title", e.target.value)} className="field-sm" aria-invalid={Boolean(errors.title)} placeholder="Thailand Honeymoon · 5N / 6D" />
              </Field>
              <Field label="Customer name" htmlFor="q-customer" error={errors.customerName}>
                <input id="q-customer" value={form.customerName} onChange={(e) => set("customerName", e.target.value)} className="field-sm" />
              </Field>
              <Field label="Destination" htmlFor="q-destination" error={errors.destination}>
                <input id="q-destination" value={form.destination} onChange={(e) => set("destination", e.target.value)} className="field-sm" />
              </Field>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
              <Field label="Start date" htmlFor="q-start" error={errors.startDate} className="col-span-2">
                <input id="q-start" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="field-sm" />
              </Field>
              <Field label="Nights" htmlFor="q-nights" error={errors.nights}>
                <input id="q-nights" inputMode="numeric" value={form.nights} onChange={(e) => set("nights", e.target.value)} className="field-sm" />
              </Field>
              <Field label="Adults" htmlFor="q-adults" error={errors.adults}>
                <input id="q-adults" inputMode="numeric" value={form.adults} onChange={(e) => set("adults", e.target.value)} className="field-sm" />
              </Field>
              <Field label="Children" htmlFor="q-children" error={errors.children}>
                <input id="q-children" inputMode="numeric" value={form.children} onChange={(e) => set("children", e.target.value)} className="field-sm" />
              </Field>
            </div>
            <div className="mt-4">
              <ImageField id="q-cover" label="Cover photo" value={form.coverImage} onChange={(value) => set("coverImage", value)} error={errors.coverImage} />
            </div>
          </Section>

          <Section
            title="Day-by-day itinerary"
            description={`${form.days.length} day${form.days.length === 1 ? "" : "s"}`}
            actions={
              <button type="button" onClick={() => addItem("days", emptyDay())} className="btn-sm-ghost">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add day
              </button>
            }
          >
            {form.days.length === 0 && <p className="text-sm text-ink-600">No days yet. Add the first day of the trip.</p>}
            <ol className="space-y-3">
              {form.days.map((day, index) => (
                <li key={index} className="rounded-xl border border-ink-900/10 bg-ivory-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 shrink-0 items-center rounded-full bg-ink-900 px-2.5 text-xs font-bold text-ivory-50">Day {index + 1}</span>
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Day {index + 1} title</span>
                      <input value={day.title} onChange={(e) => setItem("days", index, "title", e.target.value)} placeholder="e.g. Phi Phi island tour" className="field-sm" />
                    </label>
                    <div className="flex shrink-0">
                      <button type="button" disabled={index === 0} onClick={() => moveItem("days", index, -1)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ivory-200 hover:text-ink-900 disabled:opacity-30" aria-label={`Move day ${index + 1} up`}>
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button type="button" disabled={index === form.days.length - 1} onClick={() => moveItem("days", index, 1)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-ivory-200 hover:text-ink-900 disabled:opacity-30" aria-label={`Move day ${index + 1} down`}>
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => removeItem("days", index)} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-terra-500/10 hover:text-terra-600" aria-label={`Remove day ${index + 1}`}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <label className="mt-3 block">
                    <span className="sr-only">Day {index + 1} plan</span>
                    <textarea rows={3} value={day.description} onChange={(e) => setItem("days", index, "description", e.target.value)} placeholder="What happens on this day: sightseeing, transfers, meals…" className="field-sm resize-y" />
                  </label>
                  <div className="mt-3">
                    <ImageField id={`q-day-${index}-image`} label="Photo (optional)" value={day.image} onChange={(value) => setItem("days", index, "image", value)} error={errors[`days.${index}.image`]} />
                  </div>
                </li>
              ))}
            </ol>
            {form.days.length > 0 && (
              <button type="button" onClick={() => addItem("days", emptyDay())} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-terra-600 hover:text-terra-500">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add day {form.days.length + 1}
              </button>
            )}
          </Section>

          <Section
            title="Hotels"
            actions={
              <button type="button" onClick={() => addItem("hotels", emptyHotel())} className="btn-sm-ghost">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add hotel
              </button>
            }
          >
            {form.hotels.length === 0 && <p className="text-sm text-ink-600">No hotels added. Rows without a city or hotel name are skipped when saving.</p>}
            <div className="space-y-3">
              {form.hotels.map((hotel, index) => (
                <div key={index} className="grid grid-cols-2 gap-3 rounded-xl border border-ink-900/10 bg-ivory-50 p-3 sm:grid-cols-[1fr_1.5fr_1fr_4.5rem_1.2fr_auto] sm:items-end">
                  <Field label="City" htmlFor={`q-h${index}-city`}>
                    <input id={`q-h${index}-city`} value={hotel.city} onChange={(e) => setItem("hotels", index, "city", e.target.value)} className="field-sm" />
                  </Field>
                  <Field label="Hotel" htmlFor={`q-h${index}-name`}>
                    <input id={`q-h${index}-name`} value={hotel.name} onChange={(e) => setItem("hotels", index, "name", e.target.value)} className="field-sm" placeholder="or similar" />
                  </Field>
                  <Field label="Room" htmlFor={`q-h${index}-room`}>
                    <input id={`q-h${index}-room`} value={hotel.roomType} onChange={(e) => setItem("hotels", index, "roomType", e.target.value)} className="field-sm" placeholder="Deluxe" />
                  </Field>
                  <Field label="Nights" htmlFor={`q-h${index}-nights`}>
                    <input id={`q-h${index}-nights`} inputMode="numeric" value={hotel.nights} onChange={(e) => setItem("hotels", index, "nights", e.target.value)} className="field-sm" />
                  </Field>
                  <Field label="Meals" htmlFor={`q-h${index}-meals`}>
                    <input id={`q-h${index}-meals`} list="quote-meal-plans" value={hotel.mealPlan} onChange={(e) => setItem("hotels", index, "mealPlan", e.target.value)} className="field-sm" />
                  </Field>
                  <button type="button" onClick={() => removeItem("hotels", index)} className="flex h-9 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-ink-400 hover:bg-terra-500/10 hover:text-terra-600 sm:w-9" aria-label={`Remove hotel ${index + 1}`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> <span className="sm:hidden">Remove</span>
                  </button>
                </div>
              ))}
            </div>
            <datalist id="quote-meal-plans">
              {MEAL_PLANS.map((plan) => (
                <option key={plan} value={plan} />
              ))}
            </datalist>
          </Section>

          <Section title="Inclusions & exclusions" description="One item per line.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Included" htmlFor="q-inclusions">
                <textarea id="q-inclusions" rows={8} value={form.inclusions} onChange={(e) => set("inclusions", e.target.value)} className="field-sm resize-y" />
              </Field>
              <Field label="Not included" htmlFor="q-exclusions">
                <textarea id="q-exclusions" rows={8} value={form.exclusions} onChange={(e) => set("exclusions", e.target.value)} className="field-sm resize-y" />
              </Field>
            </div>
          </Section>

          <Section title="Notes & terms">
            <div className="grid gap-4">
              <Field label="Note to the customer" htmlFor="q-notes" hint="Shown near the top of the quote, e.g. visa tips or why you picked these hotels.">
                <textarea id="q-notes" rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field-sm resize-y" />
              </Field>
              <Field label="Terms & cancellation" htmlFor="q-terms">
                <textarea id="q-terms" rows={6} value={form.terms} onChange={(e) => set("terms", e.target.value)} className="field-sm resize-y" />
              </Field>
              <Field label="Valid until" htmlFor="q-valid" error={errors.validUntil} className="sm:max-w-xs">
                <input id="q-valid" type="date" value={form.validUntil} onChange={(e) => set("validUntil", e.target.value)} className="field-sm" />
              </Field>
            </div>
          </Section>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6">
          <section className="crm-card p-5">
            <h2 className="font-serif text-xl text-ink-900">Pricing</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Per adult (₹)" htmlFor="q-per-adult" error={errors["pricing.perAdult"]}>
                <input id="q-per-adult" inputMode="numeric" value={form.pricing.perAdult} onChange={(e) => setPricing("perAdult", e.target.value)} className="field-sm" placeholder="0" />
              </Field>
              <Field label="Per child (₹)" htmlFor="q-per-child" error={errors["pricing.perChild"]}>
                <input id="q-per-child" inputMode="numeric" value={form.pricing.perChild} onChange={(e) => setPricing("perChild", e.target.value)} className="field-sm" placeholder="0" />
              </Field>
              <Field label="GST %" htmlFor="q-gst" error={errors["pricing.gstPercent"]}>
                <input id="q-gst" inputMode="decimal" value={form.pricing.gstPercent} onChange={(e) => setPricing("gstPercent", e.target.value)} className="field-sm" />
              </Field>
              <Field label="TCS %" htmlFor="q-tcs" error={errors["pricing.tcsPercent"]}>
                <input id="q-tcs" inputMode="decimal" value={form.pricing.tcsPercent} onChange={(e) => setPricing("tcsPercent", e.target.value)} className="field-sm" />
              </Field>
            </div>
            <div className="mt-4 rounded-xl bg-ivory-100 px-4 py-2">
              <PriceRow label={`${toNumber(form.adults)} adult${toNumber(form.adults) === 1 ? "" : "s"} × ${formatINR(toNumber(form.pricing.perAdult))}`} value={formatINR(Math.round(toNumber(form.adults) * toNumber(form.pricing.perAdult)))} />
              {toNumber(form.children) > 0 && <PriceRow label={`${toNumber(form.children)} child${toNumber(form.children) === 1 ? "" : "ren"} × ${formatINR(toNumber(form.pricing.perChild))}`} value={formatINR(Math.round(toNumber(form.children) * toNumber(form.pricing.perChild)))} />}
              <PriceRow label="Subtotal" value={formatINR(totals.subtotal)} />
              {totals.gst > 0 && <PriceRow label={`GST ${form.pricing.gstPercent}%`} value={formatINR(totals.gst)} />}
              {totals.tcs > 0 && <PriceRow label={`TCS ${form.pricing.tcsPercent}%`} value={formatINR(totals.tcs)} />}
              <PriceRow label="Total" value={formatINR(totals.total)} strong />
            </div>
            <p className="mt-2 text-xs text-ink-400">Check current GST and TCS rates with your accountant.</p>
          </section>

          <section className="crm-card p-5">
            <button type="submit" disabled={saving || !dirty} className="btn-primary w-full justify-center">
              {saving ? "Saving…" : dirty ? "Save quote" : "All changes saved"}
            </button>
            {dirty && <p className="mt-2 text-xs text-ink-600">Save to update the PDF and the customer's link.</p>}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a href={`/q/${quote.shareToken}`} target="_blank" rel="noreferrer" className="btn-sm-ghost justify-center">
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> Preview
              </a>
              <button type="button" disabled={shareDisabled || busy === "pdf"} onClick={onDownload} className="btn-sm-ghost justify-center">
                <Download className="h-4 w-4" aria-hidden="true" /> {busy === "pdf" ? "Creating…" : "PDF"}
              </button>
            </div>

            <p className="crm-label mt-5">Send to customer</p>
            <div className="mt-2 grid gap-2">
              {enquiry?.phone ? (
                <a
                  href={shareDisabled ? undefined : whatsappHref(enquiry.phone, message)}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={shareDisabled}
                  onClick={(e) => (shareDisabled ? e.preventDefault() : onSent("WhatsApp"))}
                  className={`btn-sm justify-center bg-emerald-700! hover:bg-emerald-800! ${shareDisabled ? "pointer-events-none opacity-50" : ""}`}
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp link
                </a>
              ) : (
                <p className="text-xs text-ink-400">Add a phone number on the enquiry to send by WhatsApp.</p>
              )}
              {enquiry?.email && (
                <a
                  href={shareDisabled ? undefined : `mailto:${enquiry.email}?subject=${encodeURIComponent(`Your ${quote.destination || "trip"} itinerary from GreatVoyagers`)}&body=${encodeURIComponent(message)}`}
                  aria-disabled={shareDisabled}
                  onClick={(e) => (shareDisabled ? e.preventDefault() : onSent("Email"))}
                  className={`btn-sm-ghost justify-center ${shareDisabled ? "pointer-events-none opacity-50" : ""}`}
                >
                  <Mail className="h-4 w-4" aria-hidden="true" /> Email link
                </a>
              )}
              <button type="button" disabled={shareDisabled} onClick={onCopyLink} className="btn-sm-ghost justify-center">
                <Link2 className="h-4 w-4" aria-hidden="true" /> Copy link
              </button>
            </div>
            <p className="mt-3 text-xs text-ink-400">Sending marks the quote as sent, logs it on the enquiry and moves new enquiries to Quoted.</p>
          </section>

          <div className="flex flex-wrap gap-x-5 gap-y-2 px-1">
            <button type="button" disabled={busy === "duplicate"} onClick={onDuplicate} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
              <Copy className="h-4 w-4" aria-hidden="true" /> Copy as new version
            </button>
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-2 text-sm font-semibold text-ink-400 hover:text-terra-600">
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete quote
            </button>
          </div>
        </aside>
      </div>
    </form>
  );
}
