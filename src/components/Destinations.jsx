import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import destinations from "../data/destinations";
import { unsplash, unsplashSet } from "../lib/img";
import { openEnquiry } from "../lib/enquiry";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

const tabs = [
  { id: "international", label: "International" },
  { id: "domestic", label: "India" },
];

export default function Destinations() {
  const [active, setActive] = useState("international");

  const onKeyDown = (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const next = tabs[(tabs.findIndex((t) => t.id === active) + 1) % tabs.length].id;
    setActive(next);
    document.getElementById(`tab-${next}`)?.focus();
  };

  return (
    <section id="destinations" className="py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="Destinations"
            title="Where will you go *next?*"
            intro="A few places our travellers love. Don't see yours? We plan trips almost anywhere."
          />
          <Reveal delay={160}>
            <div role="tablist" aria-label="Destination region" className="inline-flex rounded-full bg-ivory-200 p-1.5">
              {tabs.map((tab) => {
                const selected = tab.id === active;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    aria-controls="destinations-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(tab.id)}
                    onKeyDown={onKeyDown}
                    className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-300 ${
                      selected ? "bg-ink-900 text-ivory-50 shadow-md" : "text-ink-600 hover:text-ink-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        <ul
          id="destinations-panel"
          role="tabpanel"
          aria-labelledby={`tab-${active}`}
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {destinations[active].map((place, index) => (
            <li
              key={`${active}-${place.name}`}
              className="animate-[fade-up_0.7s_var(--ease-soft)_both]"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <button
                type="button"
                onClick={() => openEnquiry({ destination: place.name })}
                className="img-zoom group relative block aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] text-left"
                aria-label={`Enquire about ${place.name}`}
              >
                <img
                  src={unsplash(place.photo, 500, 667)}
                  srcSet={unsplashSet(place.photo, [350, 500, 700], 4 / 3)}
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-transparent to-transparent" />
                {place.badge && (
                  <span className="absolute left-4 top-4 rounded-full bg-terra-500 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ivory-50">
                    {place.badge}
                  </span>
                )}
                <span className="absolute right-4 top-4 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-ivory-50 text-ink-900 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-5">
                  <span className="block text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ivory-50/70">{place.region}</span>
                  <span className="mt-1 block font-serif text-[1.75rem] leading-tight text-ivory-50">{place.name}</span>
                  <span className="mt-2 block text-sm text-ivory-50/80">{place.idealFor}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
