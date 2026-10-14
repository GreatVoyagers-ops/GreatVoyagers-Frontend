import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Plus, Upload } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { exportCustomers, listCustomers } from "./crmApi";
import { downloadXlsx, exportFileName } from "./spreadsheet";
import { ContactActions, displayPhone, EmptyState, ErrorState, formatDate, Notice, PageHeader, Pagination, SearchInput, useAction, useLoader } from "./ui";

const EXPORT_COLUMNS = [
  { header: "Customer Name", value: (c) => c.name, width: 32 },
  { header: "Mobile no.", value: (c) => c.phones.map(displayPhone).join(", "), width: 22 },
  { header: "WhatsApp", value: (c) => displayPhone(c.whatsapp), width: 18 },
  { header: "Email", value: (c) => c.email, width: 28 },
  { header: "City", value: (c) => c.city, width: 14 },
  { header: "Tags", value: (c) => c.tags.join(", "), width: 18 },
  { header: "Source", value: (c) => c.source, width: 14 },
  { header: "Enquiries", value: (c) => c.enquiryCount, width: 10 },
  { header: "Added", value: (c) => new Date(c.createdAt), width: 12 },
  { header: "Notes", value: (c) => c.notes, width: 40 },
];

export default function CustomersList() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") || "";
  const sort = params.get("sort") || "recent";
  const page = params.get("page") || "1";
  const run = useAction();
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null);

  const { status, data, error, reload } = useLoader((signal) => listCustomers({ q, sort, page, limit: 30 }, signal), [q, sort, page]);

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
      const { customers } = await exportCustomers({ q, sort });
      if (!customers.length) throw new Error("No customers to export.");
      await downloadXlsx(customers, EXPORT_COLUMNS, exportFileName("customers"));
      return customers.length;
    });
    setExporting(false);
    setMessage(result.ok ? { tone: "success", text: `Exported ${result.data} customers.` } : { tone: "error", text: result.error.message });
  };

  return (
    <>
      <PageHeader
        title="Customers"
        description="Everyone who has enquired or travelled with you."
        actions={
          <>
            <Link to="/admin/customers/import" className="btn-sm-ghost">
              <Upload className="h-4 w-4" aria-hidden="true" /> Import
            </Link>
            <button type="button" onClick={onExport} disabled={exporting} className="btn-sm-ghost">
              <Download className="h-4 w-4" aria-hidden="true" /> {exporting ? "Exporting…" : "Export"}
            </button>
            <Link to="/admin/customers/new" className="btn-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add customer
            </Link>
          </>
        }
      />

      {message && (
        <div className="mt-4">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <SearchInput value={q} onChange={(value) => update({ q: value })} placeholder="Search name, phone, email, city or tag" className="flex-1" />
        <label>
          <span className="sr-only">Sort</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value === "recent" ? "" : e.target.value })} className="field-sm sm:w-44">
            <option value="recent">Newest first</option>
            <option value="name">Name A–Z</option>
            <option value="updated">Recently updated</option>
          </select>
        </label>
      </div>

      <div className={`crm-card mt-4 overflow-hidden ${status === "refreshing" ? "opacity-60" : ""}`}>
        {status === "loading" && <PageLoader label="Loading customers" className="py-24" />}
        {status === "error" && <ErrorState message={error} onRetry={reload} />}
        {data && status !== "error" && data.customers.length === 0 && (
          <EmptyState
            title={q ? "No customers match." : "No customers yet."}
            action={
              !q && (
                <>
                  <Link to="/admin/customers/import" className="btn-sm-ghost">
                    <Upload className="h-4 w-4" aria-hidden="true" /> Import from Excel
                  </Link>
                  <Link to="/admin/customers/new" className="btn-sm">
                    <Plus className="h-4 w-4" aria-hidden="true" /> Add customer
                  </Link>
                </>
              )
            }
          >
            {!q && "Import your existing customer sheet, or customers are created automatically from new enquiries."}
          </EmptyState>
        )}
        {data && status !== "error" && data.customers.length > 0 && (
          <ul className="divide-y divide-ink-900/8">
            {data.customers.map((c) => (
              <li key={c._id} className="flex items-center gap-4 px-4 py-3 hover:bg-ivory-100/60">
                <Link to={`/admin/customers/${c._id}`} className="grid min-w-0 flex-1 gap-x-4 gap-y-0.5 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1fr)_6rem]">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-ink-900">{c.name}</span>
                    {c.tags.length > 0 && <span className="block truncate text-xs text-ink-400">{c.tags.join(" · ")}</span>}
                  </span>
                  <span className="truncate text-sm text-ink-600 md:self-center">{c.phones.map(displayPhone).join(", ") || c.email || "No contact"}</span>
                  <span className="hidden truncate text-sm text-ink-600 md:block md:self-center">{c.city || "—"}</span>
                  <span className="hidden text-sm text-ink-400 md:block md:self-center">
                    {c.enquiryCount ? `${c.enquiryCount} enq.` : formatDate(c.createdAt)}
                  </span>
                </Link>
                <div className="flex shrink-0 justify-end sm:w-28">
                  <ContactActions phone={c.phones[0]} whatsapp={c.whatsapp} email={c.email} greeting={`Hi ${c.name.split(" ")[0]}, this is GreatVoyagers.`} size="sm" />
                </div>
              </li>
            ))}
          </ul>
        )}
        {data && <Pagination page={data.page} pages={data.pages} total={data.total} noun="customers" onChange={(p) => update({ page: String(p) })} />}
      </div>
    </>
  );
}
