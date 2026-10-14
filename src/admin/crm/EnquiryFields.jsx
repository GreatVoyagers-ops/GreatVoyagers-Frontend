import { useEffect, useState } from "react";
import { Search, UserRound, X } from "lucide-react";
import { budgets, tripTypes } from "../../lib/enquiry";
import { listCustomers } from "./crmApi";
import { displayPhone, Field } from "./ui";

export function TripFields({ values, set, errors = {} }) {
  const input = (key, props = {}) => (
    <input id={`f-${key}`} value={values[key] ?? ""} onChange={(e) => set(key, e.target.value)} aria-invalid={Boolean(errors[key])} className="field-sm" {...props} />
  );
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Destination" htmlFor="f-destination" error={errors.destination} className="sm:col-span-2">
        {input("destination", { placeholder: "e.g. Bali, Leh Ladakh, Europe" })}
      </Field>
      <Field label="Trip type" htmlFor="f-tripType" error={errors.tripType} className="sm:col-span-2">
        {input("tripType", { list: "crm-trip-types", placeholder: "Holiday package" })}
        <datalist id="crm-trip-types">
          {tripTypes.map((type) => (
            <option key={type} value={type} />
          ))}
        </datalist>
      </Field>
      <Field label="Travel month" htmlFor="f-travelMonth" error={errors.travelMonth}>
        {input("travelMonth", { type: "month" })}
      </Field>
      <Field label="Duration" htmlFor="f-duration" error={errors.duration}>
        {input("duration", { placeholder: "5N / 6D" })}
      </Field>
      <Field label="Adults" htmlFor="f-adults" error={errors.adults}>
        {input("adults", { type: "number", min: 0, max: 500, inputMode: "numeric" })}
      </Field>
      <Field label="Children" htmlFor="f-children" error={errors.children}>
        {input("children", { type: "number", min: 0, max: 500, inputMode: "numeric" })}
      </Field>
      <Field label="Budget" htmlFor="f-budget" error={errors.budget} className="sm:col-span-2">
        {input("budget", { list: "crm-budgets", placeholder: "₹1,00,000 – ₹2,50,000" })}
        <datalist id="crm-budgets">
          {budgets.map((budget) => (
            <option key={budget} value={budget} />
          ))}
        </datalist>
      </Field>
      <Field label="Customer's message / requirements" htmlFor="f-message" error={errors.message} className="sm:col-span-2 lg:col-span-4">
        <textarea id="f-message" rows={3} value={values.message ?? ""} onChange={(e) => set("message", e.target.value)} className="field-sm resize-y" />
      </Field>
    </div>
  );
}

/** Search an existing customer, or leave empty to create one from the name / phone fields. */
export function CustomerPicker({ selected, onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return setResults([]);
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      listCustomers({ q: term, limit: 6 }, controller.signal)
        .then(({ customers }) => setResults(customers))
        .catch(() => {});
    }, 250);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-sea-500/30 bg-sea-100/60 px-4 py-3">
        <UserRound className="h-5 w-5 shrink-0 text-sea-500" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink-900">{selected.name}</p>
          <p className="truncate text-xs text-ink-600">{[selected.phones?.map(displayPhone).join(", "), selected.email].filter(Boolean).join(" · ") || "No contact details"}</p>
        </div>
        <button type="button" onClick={() => onSelect(null)} className="btn-sm-ghost px-3!" aria-label="Choose a different customer">
          <X className="h-4 w-4" aria-hidden="true" /> Change
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">Search existing customers</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder="Search existing customer by name or phone"
          className="field-sm pl-9"
          autoComplete="off"
        />
      </label>
      {open && results.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-ink-900/10 bg-ivory-50 shadow-lg">
          {results.map((customer) => (
            <li key={customer._id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onSelect(customer);
                  setQuery("");
                  setOpen(false);
                }}
                className="block w-full px-4 py-2.5 text-left hover:bg-ivory-100"
              >
                <span className="block truncate text-sm font-semibold text-ink-900">{customer.name}</span>
                <span className="block truncate text-xs text-ink-400">{customer.phones.map(displayPhone).join(", ") || customer.email || "No phone"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
