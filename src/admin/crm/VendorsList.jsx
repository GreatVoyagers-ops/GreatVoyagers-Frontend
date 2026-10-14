import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Plus, Star, Upload, X } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { exportVendors, listVendors } from "./crmApi";
import { BUSINESS_TYPES } from "./constants";
import { downloadXlsx, exportFileName } from "./spreadsheet";
import { ContactActions, displayPhone, EmptyState, ErrorState, Notice, PageHeader, Pagination, SearchInput, useAction, useLoader } from "./ui";

const joinContacts = (v, pick) => v.contacts.map(pick).filter(Boolean).join(", ");

const EXPORT_COLUMNS = [
  { header: "Vendor / Company Name", value: (v) => v.companyName, width: 30 },
  { header: "Business Type", value: (v) => v.businessTypes.join(", "), width: 16 },
  { header: "Destination / Service Area", value: (v) => v.destinations.join(", "), width: 24 },
  { header: "Contact Person", value: (v) => joinContacts(v, (c) => c.name), width: 24 },
  { header: "Designation", value: (v) => joinContacts(v, (c) => c.designation), width: 14 },
  { header: "Mobile Number", value: (v) => v.contacts.flatMap((c) => c.phones.map(displayPhone)).join(", "), width: 28 },
  { header: "WhatsApp Number", value: (v) => joinContacts(v, (c) => displayPhone(c.whatsapp)), width: 18 },
  { header: "Email", value: (v) => joinContacts(v, (c) => c.email), width: 30 },
  { header: "Rating", value: (v) => v.rating || "", width: 8 },
  { header: "Notes", value: (v) => v.notes, width: 40 },
];

export function Rating({ value }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < value ? "fill-current" : "text-ink-900/15"}`} aria-hidden="true" />
      ))}
    </span>
  );
}

export default function VendorsList() {
  const [params, setParams] = useSearchParams();
  const filters = { q: params.get("q") || "", type: params.get("type") || "", destination: params.get("destination") || "", sort: params.get("sort") || "", page: params.get("page") || "" };
  const run = useAction();
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null);

  const { status, data, error, reload } = useLoader((signal) => listVendors({ ...filters, limit: 30 }, signal), [params.toString()]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
    setParams(next, { replace: true });
  };

  const onExport = async () => {
    setExporting(true);
    const result = await run(async () => {
      const { vendors } = await exportVendors({ ...filters, page: "" });
      if (!vendors.length) throw new Error("No vendors match these filters.");
      await downloadXlsx(vendors, EXPORT_COLUMNS, exportFileName("vendors"));
      return vendors.length;
    });
    setExporting(false);
    setMessage(result.ok ? { tone: "success", text: `Exported ${result.data} vendors.` } : { tone: "error", text: result.error.message });
  };

  const hasFilters = filters.q || filters.type || filters.destination;

  return (
    <>
      <PageHeader
        title="Vendors"
        description="DMCs, visa agents, hotels and transport partners."
        actions={
          <>
            <Link to="/admin/vendors/import" className="btn-sm-ghost">
              <Upload className="h-4 w-4" aria-hidden="true" /> Import
            </Link>
            <button type="button" onClick={onExport} disabled={exporting} className="btn-sm-ghost">
              <Download className="h-4 w-4" aria-hidden="true" /> {exporting ? "Exporting…" : "Export"}
            </button>
            <Link to="/admin/vendors/new" className="btn-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add vendor
            </Link>
          </>
        }
      />

      {message && (
        <div className="mt-4">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1fr)_10rem_12rem_10rem_auto]">
        <SearchInput value={filters.q} onChange={(q) => update({ q })} placeholder="Search company, contact, phone or area" className="col-span-2 lg:col-span-1" />
        <label>
          <span className="sr-only">Business type</span>
          <select value={filters.type} onChange={(e) => update({ type: e.target.value })} className="field-sm">
            <option value="">All types</option>
            {BUSINESS_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Destination</span>
          <select value={filters.destination} onChange={(e) => update({ destination: e.target.value })} className="field-sm">
            <option value="">All destinations</option>
            {(data?.destinations ?? []).map((d) => (
              <option key={d}>{d}</option>
            ))}
            {filters.destination && !(data?.destinations ?? []).includes(filters.destination) && <option>{filters.destination}</option>}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort</span>
          <select value={filters.sort} onChange={(e) => update({ sort: e.target.value })} className="field-sm">
            <option value="">Name A–Z</option>
            <option value="recent">Newest first</option>
            <option value="rating">Best rated</option>
          </select>
        </label>
        {hasFilters ? (
          <button type="button" onClick={() => update({ q: "", type: "", destination: "" })} className="btn-sm-ghost col-span-2 lg:col-span-1">
            <X className="h-4 w-4" aria-hidden="true" /> Clear
          </button>
        ) : (
          <span className="hidden lg:block" />
        )}
      </div>

      <div className={`crm-card mt-4 overflow-hidden ${status === "refreshing" ? "opacity-60" : ""}`}>
        {status === "loading" && <PageLoader label="Loading vendors" className="py-24" />}
        {status === "error" && <ErrorState message={error} onRetry={reload} />}
        {data && status !== "error" && data.vendors.length === 0 && (
          <EmptyState
            title={hasFilters ? "No vendors match." : "No vendors yet."}
            action={
              !hasFilters && (
                <>
                  <Link to="/admin/vendors/import" className="btn-sm-ghost">
                    <Upload className="h-4 w-4" aria-hidden="true" /> Import from Excel
                  </Link>
                  <Link to="/admin/vendors/new" className="btn-sm">
                    <Plus className="h-4 w-4" aria-hidden="true" /> Add vendor
                  </Link>
                </>
              )
            }
          />
        )}
        {data && status !== "error" && data.vendors.length > 0 && (
          <ul className="divide-y divide-ink-900/8">
            {data.vendors.map((v) => {
              const contact = v.contacts.find((c) => c.phones.length || c.email) || v.contacts[0];
              return (
                <li key={v._id} className="flex flex-col gap-3 px-4 py-3.5 hover:bg-ivory-100/60 sm:flex-row sm:items-center">
                  <Link to={`/admin/vendors/${v._id}`} className="grid min-w-0 flex-1 gap-x-4 gap-y-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-semibold text-ink-900">{v.companyName}</span>
                        <Rating value={v.rating} />
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        {v.businessTypes.map((t) => (
                          <span key={t} className="rounded-full bg-sea-100 px-2 py-0.5 text-[0.7rem] font-bold text-sea-500">
                            {t}
                          </span>
                        ))}
                      </span>
                    </span>
                    <span className="truncate text-sm text-ink-600 md:self-center">{v.destinations.join(", ") || "—"}</span>
                    <span className="min-w-0 text-sm md:self-center">
                      <span className="block truncate text-ink-800">
                        {contact?.name || "—"}
                        {contact?.designation && <span className="text-ink-400"> · {contact.designation}</span>}
                      </span>
                      <span className="block truncate text-xs text-ink-400">
                        {contact?.phones.map(displayPhone).join(", ")}
                        {v.contacts.length > 1 && ` · +${v.contacts.length - 1} more`}
                      </span>
                    </span>
                  </Link>
                  <div className="flex shrink-0 sm:w-28 sm:justify-end">
                    {contact && <ContactActions phone={contact.phones[0]} whatsapp={contact.whatsapp} email={contact.email} greeting={`Hi ${contact.name?.split(" ")[0] || ""}, this is GreatVoyagers.`} size="sm" />}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {data && <Pagination page={data.page} pages={data.pages} total={data.total} noun="vendors" onChange={(p) => update({ page: String(p) })} />}
      </div>
    </>
  );
}
