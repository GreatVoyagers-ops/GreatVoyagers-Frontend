import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Download, FileSpreadsheet, Upload } from "lucide-react";
import { importRows } from "./crmApi";
import { downloadXlsx, readSpreadsheet } from "./spreadsheet";
import { displayPhone, Notice, PageHeader, useAction } from "./ui";

// Fields are matched in this order, so specific headers ("WhatsApp Number") claim their column before generic ones ("Mobile Number").
const CONFIG = {
  customers: {
    title: "Import customers",
    noun: "customers",
    listPath: "/admin/customers",
    fields: [
      { key: "whatsapp", label: "WhatsApp", match: ["whatsapp"] },
      { key: "email", label: "Email", match: ["email", "mail"] },
      { key: "phones", label: "Mobile / phone", match: ["mobile", "phone", "contactno", "cell", "number"] },
      { key: "name", label: "Customer name", required: true, match: ["customername", "clientname", "fullname", "name", "customer", "client"] },
      { key: "city", label: "City", match: ["city", "location", "place", "town"] },
      { key: "tags", label: "Tags", match: ["tag", "group", "category", "segment"] },
      { key: "source", label: "Source", match: ["source", "leadsource", "reference"] },
      { key: "notes", label: "Notes", match: ["note", "remark", "comment"] },
    ],
    sample: [{ name: "Aashish Jadhav", phones: "94066 86400", whatsapp: "", email: "aashish@example.com", city: "Indore", tags: "GV", source: "Referral", notes: "" }],
  },
  vendors: {
    title: "Import vendors",
    noun: "vendors",
    listPath: "/admin/vendors",
    fields: [
      { key: "whatsapp", label: "WhatsApp", match: ["whatsapp"] },
      { key: "email", label: "Email", match: ["email", "mail"] },
      { key: "designation", label: "Designation", match: ["designation", "role", "position", "title"] },
      { key: "contactName", label: "Contact person", match: ["contactperson", "contactname", "person", "contact"] },
      { key: "phones", label: "Mobile / phone", match: ["mobile", "phone", "cell", "number"] },
      { key: "businessTypes", label: "Business type", match: ["businesstype", "business", "service", "type"] },
      { key: "destinations", label: "Destination / area", match: ["destination", "servicearea", "area", "region", "location", "city"] },
      { key: "companyName", label: "Company name", required: true, match: ["vendor", "company", "agency", "firm", "name"] },
      { key: "rating", label: "Rating", match: ["rating", "stars"] },
      { key: "notes", label: "Notes", match: ["note", "remark", "comment"] },
    ],
    sample: [
      {
        companyName: "Atlas Holidays",
        businessTypes: "DMC, Tour",
        destinations: "Goa",
        contactName: "Rahul, Priya",
        designation: "Sales",
        phones: "77606 66822, 88999 04777",
        whatsapp: "77606 66822",
        email: "sales@example.com",
        rating: "",
        notes: "",
      },
    ],
  },
};

const norm = (text) => String(text).toLowerCase().replace(/[^a-z0-9]/g, "");

function autoMap(fields, headers) {
  const mapping = {};
  const used = new Set();
  for (const field of fields) {
    const index = headers.findIndex((header, i) => !used.has(i) && header && field.match.some((m) => norm(header).includes(m)));
    if (index >= 0) {
      mapping[field.key] = index;
      used.add(index);
    }
  }
  return mapping;
}

const guessHeaderRow = (rows) => {
  const index = rows.slice(0, 10).findIndex((row) => row.filter(Boolean).length >= 2);
  return index < 0 ? 0 : index;
};

const STATUS_STYLE = {
  created: { label: "New", cls: "bg-sea-100 text-sea-500" },
  skipped: { label: "Duplicate", cls: "bg-amber-100 text-amber-800" },
  failed: { label: "Error", cls: "bg-terra-500/12 text-terra-600" },
};

const Step = ({ n, label, active, done }) => (
  <li className={`flex items-center gap-2 text-sm font-semibold ${active ? "text-ink-900" : done ? "text-sea-500" : "text-ink-400"}`}>
    <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${active ? "bg-ink-900 text-ivory-50" : done ? "bg-sea-100" : "bg-ivory-200"}`}>
      {done ? "✓" : n}
    </span>
    {label}
  </li>
);

export default function ImportWizard({ kind }) {
  const config = CONFIG[kind];
  const run = useAction();
  const inputRef = useRef(null);
  const [step, setStep] = useState("upload");
  const [file, setFile] = useState(null);
  const [rows, setRows] = useState([]);
  const [headerRow, setHeaderRow] = useState(0);
  const [mapping, setMapping] = useState({});
  const [cityFromBrackets, setCityFromBrackets] = useState(false);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const headers = rows[headerRow] ?? [];
  const dataRows = useMemo(() => rows.slice(headerRow + 1), [rows, headerRow]);
  const columnOptions = headers.map((header, index) => ({ index, label: header || `Column ${index + 1}` }));

  const records = useMemo(() => {
    const out = [];
    for (const row of dataRows) {
      const record = {};
      for (const field of config.fields) if (mapping[field.key] !== undefined) record[field.key] = row[mapping[field.key]] ?? "";
      if (!Object.values(record).some(Boolean)) continue;
      if (kind === "customers" && cityFromBrackets && record.name) {
        const match = /\(([^)]+)\)/.exec(record.name);
        if (match) {
          if (!record.city) record.city = match[1].trim();
          record.name = record.name.replace(match[0], " ").replace(/\s+/g, " ").trim();
        }
      }
      out.push(record);
    }
    return out;
  }, [dataRows, mapping, config.fields, kind, cityFromBrackets]);

  const onFile = async (picked) => {
    if (!picked) return;
    setError("");
    setBusy(true);
    try {
      const parsed = await readSpreadsheet(picked);
      if (parsed.length < 2) throw new Error("That file looks empty. It needs a header row and at least one data row.");
      const guess = guessHeaderRow(parsed);
      setFile(picked);
      setRows(parsed);
      setHeaderRow(guess);
      setMapping(autoMap(config.fields, parsed[guess]));
      setStep("map");
    } catch (err) {
      setError(err.message || "Couldn't read that file.");
    } finally {
      setBusy(false);
    }
  };

  const onHeaderRow = (index) => {
    setHeaderRow(index);
    setMapping(autoMap(config.fields, rows[index] ?? []));
  };

  const missingRequired = config.fields.filter((f) => f.required && mapping[f.key] === undefined && !(kind === "vendors" && mapping.contactName !== undefined));

  const send = async (dryRun) => {
    setBusy(true);
    setError("");
    const response = await run(() => importRows(kind, records, dryRun));
    setBusy(false);
    if (!response.ok) return setError(response.error.message);
    if (dryRun) {
      setPreview(response.data);
      setFilter("all");
      setStep("preview");
    } else {
      setResult(response.data);
      setStep("done");
    }
  };

  const reset = () => {
    setStep("upload");
    setFile(null);
    setRows([]);
    setPreview(null);
    setResult(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const downloadTemplate = () =>
    downloadXlsx(
      config.sample,
      config.fields.map((f) => ({ header: f.label, value: (row) => row[f.key], width: 22 })),
      `greatvoyagers-${kind}-template.xlsx`,
    );

  const steps = ["upload", "map", "preview", "done"];
  const at = steps.indexOf(step);
  const visible = preview ? preview.results.filter((r) => filter === "all" || r.status === filter) : [];

  return (
    <>
      <PageHeader
        back={
          <Link to={config.listPath} className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-600 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to {config.noun}
          </Link>
        }
        title={config.title}
        description="Bring in your existing Excel sheet. Nothing is saved until you confirm the preview."
      />

      <ol className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
        {["Upload file", "Match columns", "Preview", "Done"].map((label, i) => (
          <Step key={label} n={i + 1} label={label} active={i === at} done={i < at} />
        ))}
      </ol>

      {error && (
        <div className="mt-4">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {step === "upload" && (
        <section className="crm-card mt-5 p-5 md:p-8">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              onFile(e.dataTransfer.files[0]);
            }}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
              dragging ? "border-terra-500 bg-terra-500/5" : "border-ink-900/15 hover:border-ink-900/30"
            }`}
          >
            <FileSpreadsheet className="h-10 w-10 text-sea-500" aria-hidden="true" />
            <span className="font-semibold text-ink-900">{busy ? "Reading file…" : "Drop your .xlsx or .csv file here, or click to choose"}</span>
            <span className="text-sm text-ink-600">The first sheet is used. Up to 5,000 rows per import.</span>
            <input ref={inputRef} type="file" accept=".xlsx,.csv" className="sr-only" onChange={(e) => onFile(e.target.files[0])} disabled={busy} />
          </label>
          <div className="mt-5 flex flex-col gap-3 text-sm text-ink-600 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Columns we look for: {config.fields.map((f) => f.label).join(", ")}.
            </p>
            <button type="button" onClick={downloadTemplate} className="btn-sm-ghost shrink-0">
              <Download className="h-4 w-4" aria-hidden="true" /> Download template
            </button>
          </div>
        </section>
      )}

      {step === "map" && (
        <section className="crm-card mt-5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-600">
              <strong className="text-ink-900">{file?.name}</strong> · {records.length} rows with data
            </p>
            <label className="flex items-center gap-2 text-sm text-ink-600">
              Header row
              <select value={headerRow} onChange={(e) => onHeaderRow(Number(e.target.value))} className="field-sm w-auto">
                {rows.slice(0, 10).map((row, i) => (
                  <option key={i} value={i}>
                    Row {i + 1}: {row.filter(Boolean).slice(0, 3).join(", ").slice(0, 40)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {config.fields.map((field) => {
              const index = mapping[field.key];
              const samples = index === undefined ? [] : dataRows.map((r) => r[index]).filter(Boolean).slice(0, 2);
              return (
                <div key={field.key} className="rounded-xl bg-ivory-100 p-3">
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-ink-900">
                      {field.label}
                      {field.required && <span className="text-terra-600"> *</span>}
                    </span>
                    <select
                      value={index ?? ""}
                      onChange={(e) => setMapping((current) => {
                        const next = { ...current };
                        if (e.target.value === "") delete next[field.key];
                        else next[field.key] = Number(e.target.value);
                        return next;
                      })}
                      className="field-sm w-48"
                    >
                      <option value="">— Don't import —</option>
                      {columnOptions.map((col) => (
                        <option key={col.index} value={col.index}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <p className="mt-1.5 truncate text-xs text-ink-400">{samples.length ? `e.g. ${samples.join(" | ")}` : "Not mapped"}</p>
                </div>
              );
            })}
          </div>

          {kind === "customers" && (
            <label className="mt-4 flex items-center gap-2 text-sm text-ink-600">
              <input type="checkbox" checked={cityFromBrackets} onChange={(e) => setCityFromBrackets(e.target.checked)} className="h-4 w-4 accent-terra-500" />
              Move text in brackets from the name to City, e.g. "Aashish Jadhav (Indore)"
            </label>
          )}
          {kind === "vendors" && <p className="mt-4 text-xs text-ink-400">Rows without a company name use the contact person's name. Several names and numbers in one cell are split into separate contacts when the counts match.</p>}

          {missingRequired.length > 0 && <p className="mt-4 text-sm font-semibold text-terra-600">Map the {missingRequired.map((f) => f.label).join(", ")} column to continue.</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => send(true)} disabled={busy || missingRequired.length > 0 || !records.length} className="btn-sm">
              {busy ? "Checking…" : `Preview ${records.length} rows`}
            </button>
            <button type="button" onClick={reset} className="btn-sm-ghost">
              Choose another file
            </button>
          </div>
        </section>
      )}

      {step === "preview" && preview && (
        <section className="crm-card mt-5 overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-ink-900/8 border-b border-ink-900/8">
            {[
              ["created", "Will be added", "text-sea-500"],
              ["skipped", "Duplicates skipped", "text-amber-700"],
              ["failed", "Rows with errors", "text-terra-600"],
            ].map(([key, label, cls]) => (
              <button key={key} type="button" onClick={() => setFilter(filter === key ? "all" : key)} className={`p-4 text-left hover:bg-ivory-100 ${filter === key ? "bg-ivory-100" : ""}`}>
                <span className={`block text-2xl font-bold tabular-nums ${cls}`}>{preview.summary[key]}</span>
                <span className="text-xs font-semibold text-ink-600">{label}</span>
              </button>
            ))}
          </div>
          <div className="max-h-[28rem] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-ivory-100 text-xs uppercase tracking-widest text-ink-400">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Row</th>
                  <th className="px-4 py-2.5 font-bold">Name</th>
                  <th className="px-4 py-2.5 font-bold">Phones</th>
                  <th className="px-4 py-2.5 font-bold">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-900/8">
                {visible.slice(0, 500).map((r) => (
                  <tr key={r.row}>
                    <td className="px-4 py-2 tabular-nums text-ink-400">{r.row}</td>
                    <td className="max-w-64 truncate px-4 py-2 font-medium text-ink-900">{r.name || "—"}</td>
                    <td className="max-w-56 truncate px-4 py-2 text-ink-600">{r.phones?.map(displayPhone).join(", ") || "—"}</td>
                    <td className="px-4 py-2">
                      <span className={`mr-2 inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${STATUS_STYLE[r.status].cls}`}>{STATUS_STYLE[r.status].label}</span>
                      <span className="text-xs text-ink-600">{r.reason}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {visible.length > 500 && <p className="p-4 text-center text-xs text-ink-400">Showing the first 500 of {visible.length} rows.</p>}
          </div>
          <div className="flex flex-wrap gap-2 border-t border-ink-900/8 p-4">
            <button type="button" onClick={() => send(false)} disabled={busy || !preview.summary.created} className="btn-sm">
              <Upload className="h-4 w-4" aria-hidden="true" /> {busy ? "Importing…" : `Import ${preview.summary.created} ${config.noun}`}
            </button>
            <button type="button" onClick={() => setStep("map")} className="btn-sm-ghost">
              Back to columns
            </button>
          </div>
        </section>
      )}

      {step === "done" && result && (
        <section className="crm-card mt-5 flex flex-col items-center gap-3 px-5 py-14 text-center">
          <CheckCircle2 className="h-10 w-10 text-sea-500" aria-hidden="true" />
          <h2 className="font-serif text-2xl text-ink-900">
            Imported {result.summary.created} {config.noun}
          </h2>
          <p className="text-sm text-ink-600">
            {result.summary.skipped} duplicates skipped · {result.summary.failed} rows with errors
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Link to={config.listPath} className="btn-sm">
              View {config.noun}
            </Link>
            <button type="button" onClick={reset} className="btn-sm-ghost">
              Import another file
            </button>
          </div>
        </section>
      )}
    </>
  );
}
