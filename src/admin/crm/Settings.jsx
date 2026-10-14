import { useEffect, useState } from "react";
import PageLoader from "../../components/PageLoader";
import { getSettings, updateSettings } from "./crmApi";
import { ErrorState, Field, Notice, PageHeader, useAction, useLoader } from "./ui";

const str = (value) => (value === undefined || value === null ? "" : String(value));

const toForm = (s) => ({
  companyName: s.companyName,
  address: s.address,
  phone: s.phone,
  whatsapp: s.whatsapp,
  email: s.email,
  website: s.website,
  gstin: s.gstin,
  bank: {
    accountName: s.bank?.accountName || "",
    accountNumber: s.bank?.accountNumber || "",
    ifsc: s.bank?.ifsc || "",
    bankName: s.bank?.bankName || "",
    branch: s.bank?.branch || "",
  },
  upiId: s.upiId,
  defaultInclusions: (s.defaultInclusions || []).join("\n"),
  defaultExclusions: (s.defaultExclusions || []).join("\n"),
  terms: s.terms,
  cancellationPolicy: s.cancellationPolicy,
  gstPercent: str(s.gstPercent),
  tcsPercent: str(s.tcsPercent),
  validityDays: str(s.validityDays),
});

export default function Settings() {
  const run = useAction();
  const { status, data, error, reload, setData } = useLoader((signal) => getSettings(signal), []);
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.settings) setForm((current) => current ?? toForm(data.settings));
  }, [data]);

  useEffect(() => {
    if (notice?.tone !== "success") return;
    const timer = window.setTimeout(() => setNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  if (status === "loading") return <PageLoader label="Loading settings" className="py-24" />;
  if (!form) return <div className="crm-card"><ErrorState message={error || "Couldn't load settings."} onRetry={reload} /></div>;

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const setBank = (key, value) => {
    setForm((current) => ({ ...current, bank: { ...current.bank, [key]: value } }));
    setErrors((current) => ({ ...current, [`bank.${key}`]: undefined }));
  };

  const dirty = JSON.stringify(form) !== JSON.stringify(toForm(data.settings));

  const onSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    const result = await run(() => updateSettings(form));
    setSaving(false);
    if (!result.ok) {
      setErrors(result.error.fields || {});
      return setNotice({ tone: "error", text: result.error.message });
    }
    setErrors({});
    setData(result.data);
    setForm(toForm(result.data.settings));
    setNotice({ tone: "success", text: "Settings saved. New quotes will use them." });
  };

  const input = (key, label, props = {}) => (
    <Field label={label} htmlFor={`s-${key}`} error={errors[key]} hint={props.hint} className={props.className}>
      <input id={`s-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)} className="field-sm" aria-invalid={Boolean(errors[key])} inputMode={props.inputMode} placeholder={props.placeholder} />
    </Field>
  );
  const bankInput = (key, label, props = {}) => (
    <Field label={label} htmlFor={`s-bank-${key}`} error={errors[`bank.${key}`]} className={props.className}>
      <input id={`s-bank-${key}`} value={form.bank[key]} onChange={(e) => setBank(key, e.target.value)} className="field-sm" inputMode={props.inputMode} />
    </Field>
  );

  return (
    <form onSubmit={onSave} noValidate>
      <PageHeader
        title="Settings"
        description="Company details, payment info and defaults used on quotes and itineraries."
        actions={
          <button type="submit" disabled={saving || !dirty} className="btn-sm">
            {saving ? "Saving…" : dirty ? "Save settings" : "Saved"}
          </button>
        }
      />

      {notice && (
        <div className="mb-4">
          <Notice tone={notice.tone}>{notice.text}</Notice>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="crm-card p-5">
          <h2 className="font-serif text-xl text-ink-900">Company</h2>
          <p className="mt-0.5 text-sm text-ink-600">Printed on every quote and PDF.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {input("companyName", "Company name", { className: "sm:col-span-2" })}
            <Field label="Address" htmlFor="s-address" error={errors.address} className="sm:col-span-2">
              <textarea id="s-address" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} className="field-sm resize-y" />
            </Field>
            {input("phone", "Phone", { inputMode: "tel", placeholder: "+91 98xxxxxxxx" })}
            {input("whatsapp", "WhatsApp", { inputMode: "tel", placeholder: "Same as phone if blank" })}
            {input("email", "Email")}
            {input("website", "Website")}
            {input("gstin", "GSTIN", { hint: "Shown only if filled in." })}
          </div>
        </section>

        <section className="crm-card p-5">
          <h2 className="font-serif text-xl text-ink-900">Payment details</h2>
          <p className="mt-0.5 text-sm text-ink-600">Shown in the “How to pay” section of quotes. Leave blank to hide.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {bankInput("accountName", "Account name", { className: "sm:col-span-2" })}
            {bankInput("accountNumber", "Account number", { inputMode: "numeric" })}
            {bankInput("ifsc", "IFSC")}
            {bankInput("bankName", "Bank")}
            {bankInput("branch", "Branch")}
            {input("upiId", "UPI ID", { placeholder: "greatvoyagers@okaxis", className: "sm:col-span-2" })}
          </div>
        </section>

        <section className="crm-card p-5">
          <h2 className="font-serif text-xl text-ink-900">Quote defaults</h2>
          <p className="mt-0.5 text-sm text-ink-600">Used when you create a new quote. Existing quotes don't change.</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {input("gstPercent", "GST %", { inputMode: "decimal" })}
            {input("tcsPercent", "TCS %", { inputMode: "decimal" })}
            {input("validityDays", "Valid for (days)", { inputMode: "numeric" })}
          </div>
          <p className="mt-2 text-xs text-ink-400">Tour package GST and TCS on overseas packages change from time to time; confirm the current rates with your accountant.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Default inclusions" htmlFor="s-inclusions" hint="One per line.">
              <textarea id="s-inclusions" rows={7} value={form.defaultInclusions} onChange={(e) => set("defaultInclusions", e.target.value)} className="field-sm resize-y" />
            </Field>
            <Field label="Default exclusions" htmlFor="s-exclusions" hint="One per line.">
              <textarea id="s-exclusions" rows={7} value={form.defaultExclusions} onChange={(e) => set("defaultExclusions", e.target.value)} className="field-sm resize-y" />
            </Field>
          </div>
        </section>

        <section className="crm-card p-5">
          <h2 className="font-serif text-xl text-ink-900">Terms</h2>
          <div className="mt-4 grid gap-4">
            <Field label="Booking terms" htmlFor="s-terms" error={errors.terms}>
              <textarea id="s-terms" rows={6} value={form.terms} onChange={(e) => set("terms", e.target.value)} className="field-sm resize-y" />
            </Field>
            <Field label="Cancellation policy" htmlFor="s-cancellation" error={errors.cancellationPolicy}>
              <textarea id="s-cancellation" rows={5} value={form.cancellationPolicy} onChange={(e) => set("cancellationPolicy", e.target.value)} className="field-sm resize-y" />
            </Field>
          </div>
        </section>
      </div>
    </form>
  );
}
