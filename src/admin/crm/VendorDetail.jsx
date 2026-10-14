import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Star, Trash2, UserPlus, X } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { createVendor, deleteVendor, getVendor, updateVendor } from "./crmApi";
import { BUSINESS_TYPES } from "./constants";
import { ContactActions, displayPhone, ErrorState, Field, formatDate, Notice, useAction, useLoader } from "./ui";

const blankContact = () => ({ name: "", designation: "", phones: "", whatsapp: "", email: "" });
const empty = { companyName: "", businessTypes: [], destinations: "", rating: 0, notes: "", contacts: [blankContact()] };

const toForm = (v) => ({
  companyName: v.companyName,
  businessTypes: v.businessTypes,
  destinations: v.destinations.join(", "),
  rating: v.rating || 0,
  notes: v.notes,
  contacts: v.contacts.length
    ? v.contacts.map((c) => ({ name: c.name, designation: c.designation, phones: c.phones.map(displayPhone).join(", "), whatsapp: displayPhone(c.whatsapp), email: c.email }))
    : [blankContact()],
});

export default function VendorDetail() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const location = useLocation();
  const run = useAction();
  const { status, data, error, reload } = useLoader((signal) => (isNew ? Promise.resolve(null) : getVendor(id, signal)), [id]);
  const [form, setForm] = useState(isNew ? empty : null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState(location.state?.notice ? { tone: "success", text: location.state.notice } : null);
  const [conflictId, setConflictId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    if (data?.vendor) setForm(toForm(data.vendor));
  }, [data]);

  if (!isNew && status === "loading") return <PageLoader label="Loading vendor" className="py-24" />;
  if (!isNew && (!data || !form)) return <div className="crm-card"><ErrorState message={error || "Vendor not found."} onRetry={reload} /></div>;

  const vendor = data?.vendor;
  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };
  const setContact = (index, key, value) =>
    setForm((current) => ({ ...current, contacts: current.contacts.map((c, i) => (i === index ? { ...c, [key]: value } : c)) }));
  const toggleType = (type) =>
    set("businessTypes", form.businessTypes.includes(type) ? form.businessTypes.filter((t) => t !== type) : [...form.businessTypes, type]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setConflictId(null);
    const result = await run(() => (isNew ? createVendor(form) : updateVendor(id, form)));
    setSaving(false);
    if (!result.ok) {
      setErrors(result.error.fields || {});
      setConflictId(result.error.data?.existingId || null);
      return setNotice({ tone: "error", text: result.error.message });
    }
    if (isNew) return navigate(`/admin/vendors/${result.data.vendor._id}`, { replace: true, state: { notice: "Vendor added." } });
    setForm(toForm(result.data.vendor));
    setNotice({ tone: "success", text: "Vendor saved." });
    reload();
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete ${vendor.companyName}? This can't be undone.`)) return;
    const result = await run(() => deleteVendor(id));
    if (!result.ok) return setNotice({ tone: "error", text: result.error.message });
    navigate("/admin/vendors", { replace: true });
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <Link to="/admin/vendors" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Vendors
      </Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl text-ink-900 md:text-4xl">{isNew ? "Add vendor" : vendor.companyName}</h1>
          {!isNew && <p className="mt-1.5 text-sm text-ink-600">Added {formatDate(vendor.createdAt)} · updated {formatDate(vendor.updatedAt)}</p>}
        </div>
        <button type="submit" disabled={saving} className="btn-sm self-start sm:self-auto">
          {saving ? "Saving…" : isNew ? "Add vendor" : "Save changes"}
        </button>
      </div>

      {notice && (
        <div className="mt-4">
          <Notice tone={notice.tone}>
            {notice.text}{" "}
            {conflictId && (
              <Link to={`/admin/vendors/${conflictId}`} className="underline">
                Open existing vendor
              </Link>
            )}
          </Notice>
        </div>
      )}

      <div className="mt-5 grid gap-4 xl:grid-cols-5">
        <section className="crm-card h-fit space-y-4 p-5 xl:col-span-2">
          <h2 className="font-serif text-xl text-ink-900">Company</h2>
          <Field label="Vendor / company name" htmlFor="v-companyName" error={errors.companyName} hint="Leave empty to use the first contact's name.">
            <input id="v-companyName" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} aria-invalid={Boolean(errors.companyName)} className="field-sm" placeholder="e.g. Atlas Holidays" />
          </Field>
          <fieldset>
            <legend className="crm-label">Business type</legend>
            <div className="flex flex-wrap gap-1.5">
              {BUSINESS_TYPES.map((type) => {
                const on = form.businessTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleType(type)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${on ? "bg-sea-500 text-ivory-50" : "bg-ivory-100 text-ink-600 ring-1 ring-ink-900/10 hover:text-ink-900"}`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <Field label="Destinations / service area" htmlFor="v-destinations" hint="Comma separated, e.g. Goa, Dubai, Europe" error={errors.destinations}>
            <input id="v-destinations" value={form.destinations} onChange={(e) => set("destinations", e.target.value)} className="field-sm" />
          </Field>
          <fieldset>
            <legend className="crm-label">Your rating</legend>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => set("rating", form.rating === n ? 0 : n)} aria-label={`${n} star${n === 1 ? "" : "s"}`} className="rounded p-0.5 text-amber-500">
                  <Star className={`h-5 w-5 ${n <= form.rating ? "fill-current" : "text-ink-900/20"}`} aria-hidden="true" />
                </button>
              ))}
              {form.rating > 0 && <span className="ml-2 text-xs text-ink-400">Click again to clear</span>}
            </div>
          </fieldset>
          <Field label="Notes" htmlFor="v-notes">
            <textarea id="v-notes" rows={4} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field-sm resize-y" placeholder="Rates, payment terms, what they're good at…" />
          </Field>
          {!isNew && (
            <button type="button" onClick={onDelete} className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-400 hover:text-terra-600">
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete vendor
            </button>
          )}
        </section>

        <section className="space-y-3 xl:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl text-ink-900">Contacts</h2>
            <button type="button" onClick={() => set("contacts", [...form.contacts, blankContact()])} className="btn-sm-ghost" disabled={form.contacts.length >= 20}>
              <UserPlus className="h-4 w-4" aria-hidden="true" /> Add contact
            </button>
          </div>
          {form.contacts.map((contact, index) => {
            const saved = vendor?.contacts[index];
            return (
              <div key={index} className="crm-card p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Contact {index + 1}</span>
                  <span className="flex items-center gap-2">
                    {saved && <ContactActions phone={saved.phones[0]} whatsapp={saved.whatsapp} email={saved.email} greeting={`Hi ${saved.name?.split(" ")[0] || ""}, this is GreatVoyagers.`} size="sm" />}
                    {form.contacts.length > 1 && (
                      <button type="button" onClick={() => set("contacts", form.contacts.filter((_, i) => i !== index))} className="flex h-8 w-8 items-center justify-center rounded-full text-ink-400 hover:bg-terra-500/10 hover:text-terra-600" aria-label={`Remove contact ${index + 1}`}>
                        <X className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Name" htmlFor={`vc-${index}-name`}>
                    <input id={`vc-${index}-name`} value={contact.name} onChange={(e) => setContact(index, "name", e.target.value)} className="field-sm" />
                  </Field>
                  <Field label="Designation" htmlFor={`vc-${index}-designation`}>
                    <input id={`vc-${index}-designation`} value={contact.designation} onChange={(e) => setContact(index, "designation", e.target.value)} className="field-sm" placeholder="Sales" />
                  </Field>
                  <Field label="Mobile numbers" htmlFor={`vc-${index}-phones`} hint="Comma separated" error={errors[`contacts.${index}.phones`]}>
                    <input id={`vc-${index}-phones`} type="tel" value={contact.phones} onChange={(e) => setContact(index, "phones", e.target.value)} className="field-sm" />
                  </Field>
                  <Field label="WhatsApp" htmlFor={`vc-${index}-whatsapp`}>
                    <input id={`vc-${index}-whatsapp`} type="tel" value={contact.whatsapp} onChange={(e) => setContact(index, "whatsapp", e.target.value)} className="field-sm" />
                  </Field>
                  <Field label="Email" htmlFor={`vc-${index}-email`} error={errors[`contacts.${index}.email`]} className="sm:col-span-2">
                    <input id={`vc-${index}-email`} type="email" value={contact.email} onChange={(e) => setContact(index, "email", e.target.value)} aria-invalid={Boolean(errors[`contacts.${index}.email`])} className="field-sm" />
                  </Field>
                </div>
              </div>
            );
          })}
          {form.contacts.length === 0 && (
            <button type="button" onClick={() => set("contacts", [blankContact()])} className="crm-card flex w-full items-center justify-center gap-2 p-6 text-sm font-semibold text-ink-600">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add a contact
            </button>
          )}
        </section>
      </div>
    </form>
  );
}
