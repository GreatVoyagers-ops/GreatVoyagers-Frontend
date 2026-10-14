import { BedDouble, CalendarDays, Check, Download, Landmark, Mail, MessageCircle, Moon, Phone, Users, X } from "lucide-react";
import { duration, hasBankDetails, longDate, quoteRef, rupees, sizedImage, travelDates, travellers } from "./quoteFormat";

const digits = (value) => String(value || "").replace(/\D/g, "");

function Fact({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terra-500/10 text-terra-600">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-400">{label}</p>
        <p className="mt-0.5 font-semibold text-ink-900">{value}</p>
      </div>
    </div>
  );
}

function Heading({ eyebrow, title }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-terra-600">{eyebrow}</p>
      <h2 className="mt-1.5 font-serif text-3xl text-ink-900 md:text-4xl">{title}</h2>
    </div>
  );
}

function List({ items, icon: Icon, tone }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item, index) => (
        <li key={index} className="flex gap-3 text-[0.95rem] leading-relaxed text-ink-800">
          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone}`}>
            <Icon className="h-3 w-3" aria-hidden="true" strokeWidth={3} />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function QuoteDocument({ quote, company, onDownload, downloading }) {
  const whatsapp = digits(company.whatsapp || company.phone);
  const question = `Hi GreatVoyagers, I have a question about my quote ${quoteRef(quote)} (${quote.title}).`;
  const children = quote.children > 0;
  const expired = quote.validUntil && new Date(quote.validUntil) < new Date(new Date().toDateString());

  return (
    <div className="min-h-screen bg-ivory-50 text-ink-900">
      <header className="sticky top-0 z-20 border-b border-ivory-50/10 bg-ink-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href={company.website || "/"} className="font-serif text-xl font-medium text-ivory-50">
            Great<em className="font-light text-terra-400">Voyagers</em>
          </a>
          <div className="flex items-center gap-2">
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(question)}`} target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-ivory-50/80 hover:text-ivory-50 sm:inline-flex">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Ask a question
              </a>
            )}
            {onDownload && (
              <button type="button" onClick={onDownload} disabled={downloading} className="inline-flex items-center gap-2 rounded-full bg-terra-500 px-4 py-2 text-sm font-bold text-ivory-50 transition-colors hover:bg-terra-600 disabled:opacity-70">
                <Download className="h-4 w-4" aria-hidden="true" /> {downloading ? "Preparing…" : "Download PDF"}
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-ink-900">
        {quote.coverImage && (
          <img
            src={sizedImage(quote.coverImage, 1600, 900)}
            srcSet={`${sizedImage(quote.coverImage, 800, 600)} 800w, ${sizedImage(quote.coverImage, 1600, 900)} 1600w`}
            sizes="100vw"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/45 to-ink-950/20" aria-hidden="true" />
        <div className="relative mx-auto flex min-h-[22rem] max-w-5xl flex-col justify-end px-4 pb-10 pt-24 sm:px-6 md:min-h-[28rem] md:pb-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sand-300">Itinerary & quote · {quoteRef(quote)}</p>
          <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.05] text-ivory-50 md:text-6xl">{quote.title}</h1>
          {quote.customerName && <p className="mt-4 text-lg text-ivory-50/85">Prepared for {quote.customerName}</p>}
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <section className="relative -mt-6 grid grid-cols-2 gap-x-4 gap-y-5 rounded-2xl border border-ink-900/8 bg-ivory-50 p-5 shadow-[0_20px_50px_-30px_rgba(15,23,42,0.45)] md:grid-cols-4 md:p-6">
          {quote.startDate && <Fact icon={CalendarDays} label="Dates" value={travelDates(quote)} />}
          <Fact icon={Moon} label="Duration" value={duration(quote)} />
          <Fact icon={Users} label="Travellers" value={travellers(quote)} />
          <div className="flex items-start gap-3">
            <div className="min-w-0">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-400">Total price</p>
              <p className="mt-0.5 font-serif text-2xl text-terra-600">{rupees(quote.totals.total)}</p>
            </div>
          </div>
        </section>

        {quote.notes && (
          <section className="mt-10 rounded-2xl bg-sand-300/25 p-5 md:p-6">
            <p className="whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-800">{quote.notes}</p>
          </section>
        )}

        {quote.days.length > 0 && (
          <section className="mt-14">
            <Heading eyebrow="Day by day" title="Your itinerary" />
            <ol className="relative">
              {quote.days.map((day, index) => (
                <li key={index} className="relative grid gap-4 pb-10 pl-12 last:pb-0 md:grid-cols-[1fr_16rem] md:gap-8 md:pl-16">
                  {index < quote.days.length - 1 && <span className="absolute bottom-0 left-[1.1rem] top-10 w-px bg-ink-900/12 md:left-[1.35rem]" aria-hidden="true" />}
                  <span className="absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full bg-ink-900 text-sm font-bold text-ivory-50 md:h-11 md:w-11">{index + 1}</span>
                  <div className="min-w-0 pt-1 md:pt-2">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">Day {index + 1}</p>
                    <h3 className="mt-1 font-serif text-2xl text-ink-900">{day.title || `Day ${index + 1}`}</h3>
                    {day.description && <p className="mt-2 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink-800">{day.description}</p>}
                  </div>
                  {day.image && (
                    <img src={sizedImage(day.image, 640, 440)} alt="" loading="lazy" className="aspect-[16/11] w-full rounded-xl bg-ivory-200 object-cover md:mt-2" />
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        {quote.hotels.length > 0 && (
          <section className="mt-16">
            <Heading eyebrow="Where you'll stay" title="Hotels" />
            <div className="grid gap-3 sm:grid-cols-2">
              {quote.hotels.map((hotel, index) => (
                <div key={index} className="flex gap-4 rounded-2xl border border-ink-900/8 bg-ivory-100 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ivory-50 text-ink-600">
                    <BedDouble className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    {hotel.city && <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink-400">{hotel.city}</p>}
                    <p className="mt-0.5 font-semibold text-ink-900">{hotel.name || "Hotel to be confirmed"}</p>
                    <p className="mt-0.5 text-sm text-ink-600">
                      {[hotel.roomType, hotel.nights ? `${hotel.nights} night${hotel.nights === 1 ? "" : "s"}` : "", hotel.mealPlan].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-400">Hotels are subject to availability; a similar hotel of the same category is booked if one is full.</p>
          </section>
        )}

        {(quote.inclusions.length > 0 || quote.exclusions.length > 0) && (
          <section className="mt-16 grid gap-10 md:grid-cols-2">
            {quote.inclusions.length > 0 && (
              <div>
                <Heading eyebrow="Included" title="What's covered" />
                <List items={quote.inclusions} icon={Check} tone="bg-emerald-100 text-emerald-700" />
              </div>
            )}
            {quote.exclusions.length > 0 && (
              <div>
                <Heading eyebrow="Not included" title="What's extra" />
                <List items={quote.exclusions} icon={X} tone="bg-ivory-200 text-ink-600" />
              </div>
            )}
          </section>
        )}

        <section className="mt-16 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-ink-950 p-6 text-ivory-50 md:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-sand-300">Price</p>
            <h2 className="mt-1.5 font-serif text-3xl">Your package price</h2>
            <dl className="mt-6 space-y-3 text-[0.95rem]">
              <div className="flex justify-between gap-4">
                <dt className="text-ivory-50/75">
                  {quote.adults} adult{quote.adults === 1 ? "" : "s"} × {rupees(quote.pricing.perAdult)}
                </dt>
                <dd className="tabular-nums">{rupees(quote.adults * quote.pricing.perAdult)}</dd>
              </div>
              {children && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ivory-50/75">
                    {quote.children} child{quote.children === 1 ? "" : "ren"} × {rupees(quote.pricing.perChild)}
                  </dt>
                  <dd className="tabular-nums">{rupees(quote.children * quote.pricing.perChild)}</dd>
                </div>
              )}
              {(quote.totals.gst > 0 || quote.totals.tcs > 0) && (
                <div className="flex justify-between gap-4 border-t border-ivory-50/10 pt-3">
                  <dt className="text-ivory-50/75">Subtotal</dt>
                  <dd className="tabular-nums">{rupees(quote.totals.subtotal)}</dd>
                </div>
              )}
              {quote.totals.gst > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ivory-50/75">GST ({quote.pricing.gstPercent}%)</dt>
                  <dd className="tabular-nums">{rupees(quote.totals.gst)}</dd>
                </div>
              )}
              {quote.totals.tcs > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-ivory-50/75">TCS ({quote.pricing.tcsPercent}%)</dt>
                  <dd className="tabular-nums">{rupees(quote.totals.tcs)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between gap-4 border-t border-ivory-50/15 pt-4">
                <dt className="font-semibold">Total</dt>
                <dd className="font-serif text-3xl tabular-nums text-sand-300">{rupees(quote.totals.total)}</dd>
              </div>
            </dl>
            {quote.validUntil && (
              <p className={`mt-5 text-sm ${expired ? "font-semibold text-terra-400" : "text-ivory-50/60"}`}>
                {expired ? `This quote expired on ${longDate(quote.validUntil)}. Ask us for updated prices.` : `Prices valid until ${longDate(quote.validUntil)}, subject to availability.`}
              </p>
            )}
          </div>

          {hasBankDetails(company) && (
            <div className="rounded-2xl border border-ink-900/8 bg-ivory-100 p-6 md:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-terra-600">Payment</p>
              <h2 className="mt-1.5 font-serif text-3xl text-ink-900">How to pay</h2>
              {company.bank?.accountNumber && (
                <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2.5 text-[0.95rem]">
                  {[
                    ["Account name", company.bank.accountName],
                    ["Account no.", company.bank.accountNumber],
                    ["IFSC", company.bank.ifsc],
                    ["Bank", [company.bank.bankName, company.bank.branch].filter(Boolean).join(", ")],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label} className="contents">
                        <dt className="text-ink-600">{label}</dt>
                        <dd className="break-all font-semibold text-ink-900">{value}</dd>
                      </div>
                    ))}
                </dl>
              )}
              {company.upiId && (
                <p className="mt-5 flex items-center gap-2 rounded-xl bg-ivory-50 px-4 py-3 text-[0.95rem]">
                  <Landmark className="h-4 w-4 shrink-0 text-ink-400" aria-hidden="true" />
                  <span className="text-ink-600">UPI</span> <span className="break-all font-semibold text-ink-900">{company.upiId}</span>
                </p>
              )}
              <p className="mt-4 text-sm text-ink-600">Please share the payment screenshot with us on WhatsApp so we can confirm your booking.</p>
            </div>
          )}
        </section>

        {quote.terms && (
          <section className="mt-16">
            <Heading eyebrow="Good to know" title="Terms & cancellation" />
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600">{quote.terms}</p>
          </section>
        )}

        <section className="mt-16 rounded-2xl bg-terra-500 p-6 text-ivory-50 md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div>
            <h2 className="font-serif text-3xl">Ready to book, or want changes?</h2>
            <p className="mt-2 text-ivory-50/85">Reply to us with any changes to dates, hotels or activities and we'll update your quote.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 md:mt-0 md:shrink-0">
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(question)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-ivory-50 px-5 py-3 text-sm font-bold text-ink-900 hover:bg-ivory-100">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp us
              </a>
            )}
            {company.phone && (
              <a href={`tel:+${digits(company.phone).length === 10 ? `91${digits(company.phone)}` : digits(company.phone)}`} className="inline-flex items-center gap-2 rounded-full border border-ivory-50/40 px-5 py-3 text-sm font-bold text-ivory-50 hover:bg-ivory-50/10">
                <Phone className="h-4 w-4" aria-hidden="true" /> Call
              </a>
            )}
            {company.email && (
              <a href={`mailto:${company.email}?subject=${encodeURIComponent(`Quote ${quoteRef(quote)}: ${quote.title}`)}`} className="inline-flex items-center gap-2 rounded-full border border-ivory-50/40 px-5 py-3 text-sm font-bold text-ivory-50 hover:bg-ivory-50/10">
                <Mail className="h-4 w-4" aria-hidden="true" /> Email
              </a>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t border-ink-900/8 py-8">
        <div className="mx-auto max-w-5xl px-4 text-sm text-ink-600 sm:px-6">
          <p className="font-semibold text-ink-900">{company.name}</p>
          {company.address && <p className="mt-1">{company.address}</p>}
          <p className="mt-1 break-words">
            {[company.phone, company.email, company.website?.replace(/^https?:\/\//, ""), company.gstin && `GSTIN ${company.gstin}`].filter(Boolean).join(" · ")}
          </p>
          <p className="mt-3 text-xs text-ink-400">
            Quote {quoteRef(quote)} · updated {longDate(quote.updatedAt)}
          </p>
        </div>
      </footer>
    </div>
  );
}
