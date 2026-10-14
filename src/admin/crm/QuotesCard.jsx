import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Copy, Eye, FilePlus2 } from "lucide-react";
import { createQuote, duplicateQuote } from "./crmApi";
import { formatDate, formatINR, useAction } from "./ui";

export const QUOTE_STATUS_STYLES = {
  Draft: "bg-ivory-200 text-ink-600",
  Sent: "bg-sea-100 text-sea-500",
  Viewed: "bg-emerald-100 text-emerald-800",
};

export function QuoteStatus({ status }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${QUOTE_STATUS_STYLES[status] || QUOTE_STATUS_STYLES.Draft}`}>{status}</span>;
}

export default function QuotesCard({ enquiryId, quotes, onError }) {
  const navigate = useNavigate();
  const run = useAction();
  const [busy, setBusy] = useState(false);

  const open = async (action) => {
    setBusy(true);
    const result = await run(action);
    setBusy(false);
    if (!result.ok) return onError(result.error.message);
    navigate(`/admin/quotes/${result.data.quote._id}`);
  };

  const latest = quotes[0];

  return (
    <section className="crm-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-ink-900">Quotes</h2>
        <button type="button" disabled={busy} onClick={() => open(() => (latest ? duplicateQuote(latest._id) : createQuote(enquiryId)))} className="btn-sm">
          <FilePlus2 className="h-4 w-4" aria-hidden="true" /> {latest ? "New version" : "Create quote"}
        </button>
      </div>
      {quotes.length === 0 ? (
        <p className="mt-3 text-sm text-ink-600">Build an itinerary with day-by-day plans, hotels and pricing, then share it as a PDF or link.</p>
      ) : (
        <ul className="mt-3 divide-y divide-ink-900/8">
          {quotes.map((quote) => (
            <li key={quote._id} className="flex items-center gap-3 py-2.5">
              <Link to={`/admin/quotes/${quote._id}`} className="min-w-0 flex-1 group">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-ink-900 group-hover:text-terra-600">
                    Q-{quote.number} v{quote.version}
                  </span>
                  <QuoteStatus status={quote.status} />
                </span>
                <span className="mt-0.5 block truncate text-xs text-ink-600">
                  {formatINR(quote.totals?.total)} · {quote.title}
                </span>
                <span className="block text-xs text-ink-400">
                  {quote.viewedAt
                    ? `Opened ${formatDate(quote.viewedAt)}${quote.viewCount > 1 ? ` · ${quote.viewCount} views` : ""}`
                    : quote.sentAt
                      ? `Sent ${formatDate(quote.sentAt)}`
                      : `Updated ${formatDate(quote.updatedAt)}`}
                </span>
              </Link>
              <a href={`/q/${quote.shareToken}`} target="_blank" rel="noreferrer" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-ivory-100 hover:text-ink-900" aria-label={`Preview Q-${quote.number} v${quote.version}`} title="Preview">
                <Eye className="h-4 w-4" aria-hidden="true" />
              </a>
              <button type="button" disabled={busy} onClick={() => open(() => duplicateQuote(quote._id))} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-400 hover:bg-ivory-100 hover:text-ink-900" aria-label={`Copy Q-${quote.number} v${quote.version} as a new version`} title="Copy as new version">
                <Copy className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
