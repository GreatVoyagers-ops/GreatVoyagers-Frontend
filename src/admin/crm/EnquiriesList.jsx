import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Download, Plus, X } from "lucide-react";
import PageLoader from "../../components/PageLoader";
import { exportEnquiries, listEnquiries, patchEnquiry } from "./crmApi";
import { DUE_FILTERS, ENQUIRY_SOURCES, ENQUIRY_STATUSES } from "./constants";
import { downloadXlsx, exportFileName } from "./spreadsheet";
import {
  ContactActions,
  displayPhone,
  EmptyState,
  ErrorState,
  FollowUpBadge,
  formatDate,
  formatDateTime,
  formatINR,
  formatMonth,
  Notice,
  PageHeader,
  Pagination,
  SearchInput,
  STATUS_STYLES,
  useAction,
  useLoader,
} from "./ui";

const FILTER_KEYS = ["status", "q", "source", "due", "from", "to", "sort", "page"];
const TABS = [{ id: "", label: "All", key: "all" }, { id: "open", label: "Open", key: "open" }, ...ENQUIRY_STATUSES.map((s) => ({ id: s, label: s, key: s }))];

const EXPORT_COLUMNS = [
  { header: "Ref", value: (e) => e.number, width: 8 },
  { header: "Created", value: (e) => new Date(e.createdAt), width: 12 },
  { header: "Name", value: (e) => e.name, width: 24 },
  { header: "Phone", value: (e) => e.phone, width: 16 },
  { header: "Email", value: (e) => e.email, width: 26 },
  { header: "Destination", value: (e) => e.destination, width: 18 },
  { header: "Trip type", value: (e) => e.tripType, width: 18 },
  { header: "Travel month", value: (e) => (e.travelMonth ? formatMonth(e.travelMonth) : ""), width: 12 },
  { header: "Duration", value: (e) => e.duration, width: 12 },
  { header: "Adults", value: (e) => e.adults, width: 8 },
  { header: "Children", value: (e) => e.children, width: 8 },
  { header: "Budget", value: (e) => e.budget, width: 18 },
  { header: "Source", value: (e) => e.source, width: 12 },
  { header: "Status", value: (e) => e.status, width: 11 },
  { header: "Follow-up", value: (e) => (e.followUpAt ? formatDateTime(e.followUpAt) : ""), width: 20 },
  { header: "Quote (INR)", value: (e) => e.quoteAmount ?? "", width: 12 },
  { header: "Booked (INR)", value: (e) => e.bookedAmount ?? "", width: 12 },
  { header: "Lost reason", value: (e) => e.lostReason, width: 18 },
  { header: "Message", value: (e) => e.message, width: 40 },
];

function StatusSelect({ enquiry, onChange, disabled }) {
  const style = STATUS_STYLES[enquiry.status];
  return (
    <label className="relative inline-flex">
      <span className="sr-only">Status for {enquiry.name}</span>
      <select
        value={enquiry.status}
        disabled={disabled}
        onChange={(event) => onChange(enquiry, event.target.value)}
        className={`cursor-pointer appearance-none rounded-full py-1 pl-3 pr-7 text-xs font-bold outline-none focus:ring-2 focus:ring-terra-400/40 disabled:opacity-60 ${style.pill}`}
      >
        {ENQUIRY_STATUSES.map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[0.6rem]" aria-hidden="true">
        ▼
      </span>
    </label>
  );
}

const travellers = (e) => `${e.adults} adult${e.adults === 1 ? "" : "s"}${e.children ? `, ${e.children} child${e.children === 1 ? "" : "ren"}` : ""}`;
const greetingFor = (e) => `Hi ${e.name.split(" ")[0]}, this is GreatVoyagers regarding your ${e.destination || "travel"} enquiry.`;

export default function EnquiriesList() {
  const [params, setParams] = useSearchParams();
  const filters = Object.fromEntries(FILTER_KEYS.map((key) => [key, params.get(key) || ""]));
  const run = useAction();
  const [busyId, setBusyId] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState(null);

  const { status, data, error, reload, setData } = useLoader((signal) => listEnquiries({ ...filters, limit: 25 }, signal), [params.toString()]);

  const update = (changes) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    if (!("page" in changes)) next.delete("page");
    setParams(next, { replace: true });
  };

  const onStatus = async (enquiry, nextStatus) => {
    setBusyId(enquiry._id);
    const result = await run(() => patchEnquiry(enquiry._id, { status: nextStatus }));
    setBusyId(null);
    if (!result.ok) return setMessage({ tone: "error", text: result.error.message });
    setData((current) => ({ ...current, enquiries: current.enquiries.map((e) => (e._id === enquiry._id ? { ...e, status: nextStatus } : e)) }));
    reload();
  };

  const onExport = async () => {
    setExporting(true);
    const result = await run(async () => {
      const { enquiries } = await exportEnquiries({ ...filters, page: "" });
      if (!enquiries.length) throw new Error("No enquiries match these filters.");
      await downloadXlsx(enquiries, EXPORT_COLUMNS, exportFileName("enquiries"));
      return enquiries.length;
    });
    setExporting(false);
    setMessage(result.ok ? { tone: "success", text: `Exported ${result.data} enquiries.` } : { tone: "error", text: result.error.message });
  };

  const hasFilters = filters.q || filters.source || filters.due || filters.from || filters.to;
  const counts = data?.counts ?? {};

  return (
    <>
      <PageHeader
        title="Enquiries"
        description="Track every lead from first message to booking."
        actions={
          <>
            <button type="button" onClick={onExport} disabled={exporting} className="btn-sm-ghost">
              <Download className="h-4 w-4" aria-hidden="true" /> {exporting ? "Exporting…" : "Export"}
            </button>
            <Link to="/admin/enquiries/new" className="btn-sm">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add enquiry
            </Link>
          </>
        }
      />

      {message && (
        <div className="mt-4">
          <Notice tone={message.tone}>{message.text}</Notice>
        </div>
      )}

      <div role="tablist" aria-label="Filter by status" className="-mx-4 mt-6 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none]">
        {TABS.map((tab) => {
          const active = filters.status === tab.id;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => update({ status: tab.id })}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active ? "bg-ink-900 text-ivory-50" : "bg-ivory-50 text-ink-600 ring-1 ring-ink-900/10 hover:text-ink-900"
              }`}
            >
              {tab.label} <span className={active ? "text-ivory-50/60" : "text-ink-400"}>{counts[tab.key] ?? ""}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-[minmax(0,1fr)_10rem_12rem_9.5rem_9.5rem_auto]">
        <SearchInput value={filters.q} onChange={(q) => update({ q })} placeholder="Search name, phone, destination or #ref" className="col-span-2 lg:col-span-1" />
        <label>
          <span className="sr-only">Source</span>
          <select value={filters.source} onChange={(e) => update({ source: e.target.value })} className="field-sm">
            <option value="">All sources</option>
            {ENQUIRY_SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Follow-up</span>
          <select value={filters.due} onChange={(e) => update({ due: e.target.value, sort: e.target.value ? "followup" : "" })} className="field-sm">
            {DUE_FILTERS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Created from</span>
          <input type="date" value={filters.from} onChange={(e) => update({ from: e.target.value })} className="field-sm" title="Created from" />
        </label>
        <label>
          <span className="sr-only">Created to</span>
          <input type="date" value={filters.to} onChange={(e) => update({ to: e.target.value })} className="field-sm" title="Created to" />
        </label>
        {hasFilters ? (
          <button type="button" onClick={() => update({ q: "", source: "", due: "", from: "", to: "", sort: "" })} className="btn-sm-ghost col-span-2 lg:col-span-1">
            <X className="h-4 w-4" aria-hidden="true" /> Clear
          </button>
        ) : (
          <span className="hidden lg:block" />
        )}
      </div>

      <div className={`crm-card mt-4 overflow-hidden transition-opacity ${status === "refreshing" ? "opacity-60" : ""}`}>
        {status === "loading" && <PageLoader label="Loading enquiries" className="py-24" />}
        {status === "error" && <ErrorState message={error} onRetry={reload} />}
        {data && status !== "error" && data.enquiries.length === 0 && (
          <EmptyState
            title={hasFilters || filters.status ? "No enquiries match." : "No enquiries yet."}
            action={
              <Link to="/admin/enquiries/new" className="btn-sm">
                <Plus className="h-4 w-4" aria-hidden="true" /> Add enquiry
              </Link>
            }
          >
            {!hasFilters && !filters.status && "Website enquiries appear here automatically. Add phone or WhatsApp leads yourself."}
          </EmptyState>
        )}

        {data && status !== "error" && data.enquiries.length > 0 && (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink-900/8 bg-ivory-100/60 text-xs uppercase tracking-[0.1em] text-ink-400">
                  <tr>
                    <th className="px-4 py-3 font-bold">Customer</th>
                    <th className="px-4 py-3 font-bold">Trip</th>
                    <th className="px-4 py-3 font-bold">Source</th>
                    <th className="px-4 py-3 font-bold">Status</th>
                    <th className="px-4 py-3 font-bold">Follow-up</th>
                    <th className="px-4 py-3 font-bold">Quote</th>
                    <th className="px-4 py-3 font-bold">
                      <span className="sr-only">Contact</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/8">
                  {data.enquiries.map((e) => (
                    <tr key={e._id} className="align-middle hover:bg-ivory-100/60">
                      <td className="max-w-56 px-4 py-3">
                        <Link to={`/admin/enquiries/${e._id}`} className="block truncate font-semibold text-ink-900 hover:text-terra-600">
                          {e.name}
                        </Link>
                        <span className="block truncate text-xs text-ink-400">
                          #{e.number} · {displayPhone(e.phone) || e.email || "No contact"} · {formatDate(e.createdAt)}
                        </span>
                      </td>
                      <td className="max-w-64 px-4 py-3">
                        <span className="block truncate font-medium text-ink-800">{e.destination || "—"}</span>
                        <span className="block truncate text-xs text-ink-400">
                          {[e.tripType, e.travelMonth && formatMonth(e.travelMonth), travellers(e)].filter(Boolean).join(" · ")}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-ink-600">{e.source}</td>
                      <td className="px-4 py-3">
                        <StatusSelect enquiry={e} onChange={onStatus} disabled={busyId === e._id} />
                      </td>
                      <td className="px-4 py-3">
                        <FollowUpBadge value={e.followUpAt} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-ink-600">{formatINR(e.bookedAmount ?? e.quoteAmount)}</td>
                      <td className="px-4 py-3 text-right">
                        <ContactActions phone={e.phone} email={e.email} greeting={greetingFor(e)} subject={`Your ${e.destination || "travel"} enquiry`} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink-900/8 md:hidden">
              {data.enquiries.map((e) => (
                <li key={e._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link to={`/admin/enquiries/${e._id}`} className="min-w-0">
                      <span className="block truncate font-semibold text-ink-900">{e.name}</span>
                      <span className="block truncate text-xs text-ink-400">
                        #{e.number} · {e.source} · {formatDate(e.createdAt)}
                      </span>
                    </Link>
                    <StatusSelect enquiry={e} onChange={onStatus} disabled={busyId === e._id} />
                  </div>
                  <p className="mt-2 truncate text-sm text-ink-800">
                    {[e.destination || "Destination not set", e.tripType, e.travelMonth && formatMonth(e.travelMonth)].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <FollowUpBadge value={e.followUpAt} />
                    <ContactActions phone={e.phone} email={e.email} greeting={greetingFor(e)} size="sm" />
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {data && <Pagination page={data.page} pages={data.pages} total={data.total} noun="enquiries" onChange={(page) => update({ page: String(page) })} />}
      </div>
    </>
  );
}
