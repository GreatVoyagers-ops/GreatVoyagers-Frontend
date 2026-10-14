import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { createEnquiry, getCustomer } from "./crmApi";
import { ENQUIRY_SOURCES, ENQUIRY_STATUSES } from "./constants";
import { CustomerPicker, TripFields } from "./EnquiryFields";
import { Field, fromLocalInput, Notice, PageHeader, useAction } from "./ui";

const initial = {
  name: "",
  phone: "",
  email: "",
  destination: "",
  tripType: "",
  travelMonth: "",
  duration: "",
  adults: "2",
  children: "0",
  budget: "",
  message: "",
  source: "Phone",
  status: "New",
  followUpAt: "",
  quoteAmount: "",
  note: "",
};

export default function EnquiryNew() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const run = useAction();
  const [values, setValues] = useState(initial);
  const [customer, setCustomer] = useState(null);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const customerId = params.get("customer");
  useEffect(() => {
    if (!customerId) return;
    const controller = new AbortController();
    getCustomer(customerId, controller.signal)
      .then(({ customer: found }) => setCustomer(found))
      .catch(() => {});
    return () => controller.abort();
  }, [customerId]);

  const set = (key, value) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!customer && !values.name.trim()) return setErrors({ name: "Enter the customer's name or pick an existing customer." });
    setSaving(true);
    setFormError("");
    const body = {
      ...values,
      customerId: customer?._id || "",
      ...(customer && { name: "", phone: "", email: "" }),
      followUpAt: fromLocalInput(values.followUpAt),
    };
    const result = await run(() => createEnquiry(body));
    setSaving(false);
    if (!result.ok) {
      setErrors(result.error.fields || {});
      return setFormError(result.error.message);
    }
    navigate(`/admin/enquiries/${result.data.enquiry._id}`, { replace: true, state: { notice: `Enquiry #${result.data.enquiry.number} added.` } });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        back={
          <Link to="/admin/enquiries" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Enquiries
          </Link>
        }
        title="Add enquiry"
        description="For leads that came in by phone, WhatsApp, walk-in or referral."
      />

      {formError && (
        <div className="mt-5">
          <Notice tone="error">{formError}</Notice>
        </div>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <section className="crm-card p-5">
            <h2 className="font-serif text-xl text-ink-900">Customer</h2>
            <div className="mt-4">
              <CustomerPicker selected={customer} onSelect={setCustomer} />
            </div>
            {!customer && (
              <>
                <p className="my-4 text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Or add a new customer</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Name *" htmlFor="f-name" error={errors.name}>
                    <input id="f-name" value={values.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} className="field-sm" />
                  </Field>
                  <Field label="Phone" htmlFor="f-phone" error={errors.phone} hint="Matched to an existing customer automatically.">
                    <input id="f-phone" type="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} className="field-sm" placeholder="98765 43210" />
                  </Field>
                  <Field label="Email" htmlFor="f-email" error={errors.email}>
                    <input id="f-email" type="email" value={values.email} onChange={(e) => set("email", e.target.value)} aria-invalid={Boolean(errors.email)} className="field-sm" />
                  </Field>
                </div>
              </>
            )}
          </section>

          <section className="crm-card p-5">
            <h2 className="mb-4 font-serif text-xl text-ink-900">Trip details</h2>
            <TripFields values={values} set={set} errors={errors} />
          </section>
        </div>

        <aside className="crm-card h-fit space-y-4 p-5">
          <h2 className="font-serif text-xl text-ink-900">Sales</h2>
          <Field label="Source" htmlFor="f-source">
            <select id="f-source" value={values.source} onChange={(e) => set("source", e.target.value)} className="field-sm">
              {ENQUIRY_SOURCES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="f-status">
            <select id="f-status" value={values.status} onChange={(e) => set("status", e.target.value)} className="field-sm">
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Next follow-up" htmlFor="f-followUpAt">
            <input id="f-followUpAt" type="datetime-local" value={values.followUpAt} onChange={(e) => set("followUpAt", e.target.value)} className="field-sm" />
          </Field>
          <Field label="Quote amount (₹)" htmlFor="f-quoteAmount" error={errors.quoteAmount}>
            <input id="f-quoteAmount" inputMode="numeric" value={values.quoteAmount} onChange={(e) => set("quoteAmount", e.target.value)} className="field-sm" placeholder="Optional" />
          </Field>
          <Field label="First note" htmlFor="f-note">
            <textarea id="f-note" rows={3} value={values.note} onChange={(e) => set("note", e.target.value)} className="field-sm resize-y" placeholder="What did you discuss?" />
          </Field>
          <button type="submit" disabled={saving} className="btn-sm w-full py-2.5">
            {saving ? "Saving…" : "Save enquiry"}
          </button>
        </aside>
      </div>
    </form>
  );
}
