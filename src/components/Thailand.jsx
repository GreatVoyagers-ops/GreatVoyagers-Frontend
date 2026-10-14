import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { thaiDestinations, dmcServices } from "../data/thailand";
import { photos, unsplash, unsplashSet } from "../lib/img";
import { openEnquiry } from "../lib/enquiry";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

function CityCard({ city, index }) {
  return (
    <Reveal as="li" delay={(index % 3) * 90}>
      <button
        type="button"
        onClick={() => openEnquiry({ destination: `${city.name}, Thailand`, tripType: "Holiday package" })}
        className="img-zoom group relative block aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] text-left"
        aria-label={`Enquire about ${city.name}`}
      >
        <img
          src={unsplash(city.photo, 600, 750)}
          srcSet={unsplashSet(city.photo, [400, 600, 800], 1.25)}
          sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 90vw"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/10 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 p-6">
          <span className="block font-serif text-3xl text-ivory-50">{city.name}</span>
          <span className="mt-1 block text-sm text-ivory-50/75">{city.note}</span>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-terra-400 transition-transform duration-500 group-hover:translate-x-1">
            Plan this trip <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </span>
        <span className="absolute left-5 top-5 rounded-full bg-ivory-50/15 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ivory-50 ring-1 ring-ivory-50/25 backdrop-blur-sm">
          Thailand
        </span>
      </button>
    </Reveal>
  );
}

export default function Thailand() {
  return (
    <section id="thailand" className="relative overflow-hidden bg-ink-900 py-24 text-ivory-50 md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-20 h-[30rem] w-[30rem] rounded-full bg-sea-500/25 blur-3xl"
      />
      <div className="container-page relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionHeading
              tone="dark"
              eyebrow="Our speciality · Thailand tours & DMC"
              title="Thailand, *the way locals know it.*"
            />
          </div>
          <Reveal delay={160} className="lg:col-span-5">
            <p className="text-base leading-relaxed text-ivory-50/75 md:text-lg">
              We run our own destination management in Thailand: hotel contracts, transfers, tours and a local
              operations team. That means better rates, faster confirmations and real help when you need it.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => openEnquiry({ destination: "Thailand", tripType: "Holiday package" })}
                className="btn-primary bg-terra-500 hover:bg-terra-400"
              >
                Plan a Thailand trip <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <a
                href="#dmc"
                className="inline-flex items-center gap-2 rounded-full border border-ivory-50/25 px-6 py-3.5 text-sm font-bold transition-colors hover:border-ivory-50 hover:bg-ivory-50 hover:text-ink-900"
              >
                For travel agents
              </a>
            </div>
          </Reveal>
        </div>

        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {thaiDestinations.map((city, index) => (
            <CityCard key={city.name} city={city} index={index} />
          ))}
        </ul>

        <div id="dmc" className="mt-20 grid overflow-hidden rounded-[2rem] bg-ink-800 ring-1 ring-ivory-50/10 lg:grid-cols-12">
          <Reveal className="relative min-h-[18rem] lg:col-span-5">
            <img
              src={unsplash(photos.bangkokNight, 900, 1000)}
              srcSet={unsplashSet(photos.bangkokNight, [500, 900, 1200], 1.1)}
              sizes="(min-width: 1024px) 40vw, 100vw"
              alt="A busy Bangkok street lit up at night"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink-950/80 to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-ink-800/40" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="font-serif text-3xl leading-tight text-ivory-50">Your ground team in Thailand.</p>
            </div>
          </Reveal>

          <div className="p-7 md:p-10 lg:col-span-7 lg:p-12">
            <Reveal as="p" className="eyebrow text-terra-400">
              DMC services · B2B
            </Reveal>
            <Reveal as="h3" delay={80} className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              Partner with us for Thailand ground handling
            </Reveal>
            <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {dmcServices.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal as="li" key={item.title} delay={index * 60} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terra-500/15 text-terra-400">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block font-bold">{item.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-ivory-50/65">{item.text}</span>
                    </span>
                  </Reveal>
                );
              })}
            </ul>
            <Reveal delay={200} className="mt-10 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => openEnquiry({ destination: "Thailand", tripType: "B2B / DMC enquiry" })}
                className="inline-flex items-center gap-2 rounded-full bg-ivory-50 px-6 py-3.5 text-sm font-bold text-ink-900 transition-colors hover:bg-terra-400 hover:text-ivory-50"
              >
                Send a DMC enquiry <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="flex items-center gap-2 text-sm text-ivory-50/70">
                <Check className="h-4 w-4 text-terra-400" aria-hidden="true" />
                Quick quotes for agents & groups
              </span>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
