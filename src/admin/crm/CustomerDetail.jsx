import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { createCustomer, deleteCustomer, getCustomer, updateCustomer } from "./crmApi";
import { ContactActions, displayPhone, ErrorState, Field, formatDate, formatINR, formatMonth, Notice, StatusPill, useAction, useLoader } from "./ui";

const empty = { name: "", phones: "", whatsapp: "", email: "", city: "", tags: "", source: "", notes: "" };

const toForm = (c) => ({
  name: c.name,
  phones: c.phones.map(displayPhone).join(", "),
  whatsapp: displayPhone(c.whatsapp),
  email: c.email,
  city: c.city,
  tags: c.tags.join(", "),
  source: c.source,
  notes: c.notes,
});

export default function CustomerDetail() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const location = useLocation();
  const run = useAction();
  const { status, data, error, reload } = useLoader((signal) => (isNew ? Promise.resolve(null) : getCustomer(id, signal)), [id]);
  const [form, setForm] = useState(isNew ? empty : null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(location.state?.notice ? { tone: "success", text: location.state.notice } : null);
  const [conflictId, setConflictId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    if (data?.customer) setForm(toForm(data.customer));
  }, [data]);

  if (!isNew && status === "loading") return <PageLoader label="Loading customer" className="py-24" />;
  if (!isNew && (!data || !form)) return <div className="crm-card"><ErrorState message={error || "Customer not found."} onRetry={reload} /></div>;

  const customer = data?.customer;
  const enquiries = data?.enquiries ?? [];
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return setErrors({ name: "Enter the customer's name." });
    setSaving(true);
    setConflictId(null);
    const result = await run(() => (isNew ? createCustomer(form) : updateCustomer(id, form)));
    setSaving(false);
    if (!result.ok) {
      setErrors(result.error.fields || {});
      setConflictId(result.error.data?.existingId || null);
      return setNotice({ tone: "error", text: result.error.message });
    }
    if (isNew) return navigate(`/admin/customers/${result.data.customer._id}`, { replace: true, state: { notice: "Customer added." } });
    setForm(toForm(result.data.customer));
    setNotice({ tone: "success", text: "Customer saved." });
    reload();
  };

  const onDelete = async () => {
    const extra = enquiries.length ? ` Their ${enquiries.length} enquiries will be kept.` : "";
    if (!window.confirm(`Delete ${customer.name}?${extra}`)) return;
    const result = await run(() => deleteCustomer(id));
    if (!result.ok) return setNotice({ tone: "error", text: result.error.message });
    navigate("/admin/customers", { replace: true });
  };

  const input = (key, props = {}) => (
    <input id={`c-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)} aria-invalid={Boolean(errors[key])} className="field-sm" {...props} />
  );
  const won = enquiries.filter((e) => e.status === "Won");

  return (
    <>
      <Link to="/admin/customers" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Customers
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900 md:text-4xl">{isNew ? "Add customer" : customer.name}</h1>
          {!isNew && (
            <p className="mt-1.5 text-sm text-ink-600">
              Added {formatDate(customer.createdAt)}
              {customer.source && ` · ${customer.source}`}
              {won.length > 0 && ` · ${won.length} booking${won.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>
        {!isNew && (
          <div className="flex items-center gap-2">
            <ContactActions phone={customer.phones[0]} whatsapp={customer.whatsapp} email={customer.email} greeting={`Hi ${customer.name.split(" ")[0]}, this is GreatVoyagers.`} />
            <Link to={`/admin/enquiries/new?customer=${customer._id}`} className="btn-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> New enquiry
            </Link>
          </div>
        )}
      </div>

      {notice && (
        <div className="mt-4">
          <Notice tone={notice.tone}>
            {notice.text}{" "}
            {conflictId && (
              <Link to={`/admin/customers/${conflictId}`} className="underline">
                Open existing customer
              </Link>
            )}
          </Notice>
        </div>
      )}

      <div className={`mt-5 grid gap-4 ${isNew ? "max-w-3xl" : "xl:grid-cols-5"}`}>
        <form onSubmit={onSubmit} noValidate className="crm-card p-5 xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *" htmlFor="c-name" error={errors.name} className="sm:col-span-2">
              {input("name", { placeholder: "e.g. Aashish Jadhav" })}
            </Field>
            <Field label="Phone numbers" htmlFor="c-phones" error={errors.phones} hint="Separate several numbers with commas." className="sm:col-span-2">
              {input("phones", { type: "tel", placeholder: "94066 86400, 98765 43210" })}
            </Field>
            <Field label="WhatsApp (if different)" htmlFor="c-whatsapp" error={errors.whatsapp}>
              {input("whatsapp", { type: "tel" })}
            </Field>
            <Field label="Email" htmlFor="c-email" error={errors.email}>
              {input("email", { type: "email" })}
            </Field>
            <Field label="City" htmlFor="c-city" error={errors.city}>
              {input("city", { placeholder: "Indore" })}
            </Field>
            <Field label="Source" htmlFor="c-source" error={errors.source}>
              {input("source", { placeholder: "Referral, Instagram…" })}
            </Field>
            <Field label="Tags" htmlFor="c-tags" error={errors.tags} hint="Comma separated, e.g. GV, Aristo, VIP" className="sm:col-span-2">
              {input("tags")}
            </Field>
            <Field label="Notes" htmlFor="c-notes" error={errors.notes} className="sm:col-span-2">
              <textarea id="c-notes" rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field-sm resize-y" placeholder="Preferences, passport details to collect, anniversaries…" />
            </Field>
          </div>
          <div className="mt-5 flex items-center justify-between gap-3">
            <button type="submit" disabled={saving} className="btn-sm">
              {saving ? "Saving…" : isNew ? "Add customer" : "Save changes"}
            </button>
            {!isNew && (
              <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-terra-600">
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
              </button>
            )}
          </div>
        </form>

        {!isNew && (
          <section className="crm-card h-fit overflow-hidden xl:col-span-3">
            <div className="flex items-center justify-between gap-3 p-5 pb-3">
              <h2 className="font-serif text-xl text-ink-900">Enquiries</h2>
              <span className="text-sm text-ink-400">{enquiries.length}</span>
            </div>
            {enquiries.length === 0 ? (
              <p className="px-5 pb-8 text-sm text-ink-600">No enquiries yet for this customer.</p>
            ) : (
              <ul className="divide-y divide-ink-900/8 border-t border-ink-900/8">
                {enquiries.map((e) => (
                  <li key={e._id}>
                    <Link to={`/admin/enquiries/${e._id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ivory-100/60">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-ink-900">
                          {e.destination || "Destination not set"} <span className="font-normal text-ink-400">#{e.number}</span>
                        </span>
                        <span className="block truncate text-xs text-ink-600">
                          {[e.tripType, e.travelMonth && formatMonth(e.travelMonth), e.source, formatDate(e.createdAt)].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="hidden text-sm tabular-nums text-ink-600 sm:block">{formatINR(e.bookedAmount ?? e.quoteAmount)}</span>
                      <StatusPill status={e.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
