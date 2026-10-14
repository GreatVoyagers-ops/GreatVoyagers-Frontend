import { useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, Clock, MapPin, Plane, Users } from "lucide-react";
import { photos, unsplash, unsplashSet } from "../lib/img";
import { openEnquiry } from "../lib/enquiry";
import { Emphasis } from "./SectionHeading";
import Reveal from "./Reveal";

const chips = ["Custom itineraries", "Best-rate hotels", "24/7 trip support"];

function QuickEnquiry() {
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [travellers, setTravellers] = useState("2");

  const submit = (event) => {
    event.preventDefault();
    openEnquiry({ destination, travelDate, adults: travellers });
  };

  return (
    <form
      onSubmit={submit}
      aria-label="Quick trip enquiry"
      className="grid gap-2 rounded-[1.75rem] border border-ink-900/8 bg-ivory-50 p-2 shadow-[0_30px_60px_-30px_rgba(15,29,46,0.35)] sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_0.8fr_auto]"
    >
      <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors focus-within:bg-ivory-200/60 hover:bg-ivory-200/60">
        <MapPin className="h-5 w-5 shrink-0 text-terra-500" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-400">Where to?</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Thailand, Bali, Kashmir..."
            className="w-full bg-transparent text-[0.95rem] font-semibold text-ink-900 outline-none placeholder:font-medium placeholder:text-ink-400"
          />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors focus-within:bg-ivory-200/60 hover:bg-ivory-200/60">
        <CalendarDays className="h-5 w-5 shrink-0 text-terra-500" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-400">When</span>
          <input
            type="month"
            value={travelDate}
            onChange={(e) => setTravelDate(e.target.value)}
            className="w-full bg-transparent text-[0.95rem] font-semibold text-ink-900 outline-none"
          />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors focus-within:bg-ivory-200/60 hover:bg-ivory-200/60">
        <Users className="h-5 w-5 shrink-0 text-terra-500" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-ink-400">Travellers</span>
          <select
            value={travellers}
            onChange={(e) => setTravellers(e.target.value)}
            className="w-full bg-transparent text-[0.95rem] font-semibold text-ink-900 outline-none"
          >
            {["1", "2", "3", "4", "5", "6", "7", "8", "10+", "20+"].map((n) => (
              <option key={n} value={n}>
                {n} {n === "1" ? "adult" : "adults"}
              </option>
            ))}
          </select>
        </span>
      </label>
      <button type="submit" className="btn-primary rounded-2xl px-7 py-4 sm:col-span-2 lg:col-span-1">
        Get a free quote
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
}

function FlightPath() {
  return (
    <svg
      viewBox="0 0 400 220"
      fill="none"
      aria-hidden="true"
      className="pointer-events-none absolute -left-10 top-6 z-20 hidden w-[70%] text-terra-500 md:block"
    >
      <path
        d="M10 200 C 90 60, 230 30, 390 70"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="2 10"
        className="animate-dash"
      />
      <g transform="translate(374 66)">
        <circle r="17" fill="#fdfbf7" />
        <path
          transform="rotate(100) translate(-12 -12)"
          fill="currentColor"
          d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
        />
      </g>
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-10 md:pt-16 lg:pb-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-sand-300/50 blur-3xl"
      />

      <div className="container-page relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-6">
          <Reveal as="p" className="eyebrow">
            Thailand specialists · Worldwide holidays
          </Reveal>
          <Reveal as="h1" delay={80} className="heading-xl mt-6 text-ink-900">
            <Emphasis text="Go somewhere that *stays* with you." />
          </Reveal>
          <Reveal as="p" delay={160} className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
            Holidays, flights, hotels, cruises and visas, planned by people who travel. And when it comes to
            Thailand, we're the team on the ground.
          </Reveal>
          <Reveal delay={240} className="mt-9 flex flex-wrap gap-3">
            <button type="button" onClick={() => openEnquiry()} className="btn-primary px-7 py-4">
              Plan my trip
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <a href="#thailand" className="btn-ghost px-7 py-4">
              Explore Thailand
            </a>
          </Reveal>
          <Reveal as="ul" delay={320} className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
            {chips.map((chip) => (
              <li key={chip} className="flex items-center gap-2 text-sm font-semibold text-ink-800">
                <BadgeCheck className="h-5 w-5 text-sea-500" aria-hidden="true" />
                {chip}
              </li>
            ))}
          </Reveal>
        </div>

        <Reveal delay={150} className="relative lg:col-span-6">
          <div className="relative mx-auto h-[26rem] max-w-xl sm:h-[32rem] lg:h-[36rem]">
            <FlightPath />

            <div className="absolute right-0 top-0 h-[88%] w-[64%] overflow-hidden rounded-t-full rounded-b-[2rem] shadow-[0_40px_80px_-40px_rgba(15,29,46,0.6)]">
              <img
                src={unsplash(photos.railayLongtails, 900, 1200)}
                srcSet={unsplashSet(photos.railayLongtails, [500, 700, 900, 1200], 4 / 3)}
                sizes="(min-width: 1024px) 30vw, 60vw"
                alt="Longtail boats on a Thailand beach beneath limestone cliffs"
                className="h-full w-full object-cover"
                fetchPriority="high"
              />
            </div>

            <div className="absolute bottom-0 left-0 h-[52%] w-[46%] overflow-hidden rounded-[2rem] border-[6px] border-ivory-100 shadow-[0_30px_60px_-30px_rgba(15,29,46,0.6)]">
              <img
                src={unsplash(photos.thaiTemple, 600, 700)}
                srcSet={unsplashSet(photos.thaiTemple, [400, 600, 800], 7 / 6)}
                sizes="(min-width: 1024px) 22vw, 45vw"
                alt="Ornate Thai temple under a blue sky"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute left-[4%] top-[18%] z-30 flex animate-float items-center gap-3 rounded-2xl bg-ivory-50/95 px-4 py-3 shadow-[0_20px_40px_-20px_rgba(15,29,46,0.5)] backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terra-500 text-ivory-50">
                <Plane className="h-5 w-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-400">Thailand DMC</span>
                <span className="block text-sm font-bold text-ink-900">Local team, on ground</span>
              </span>
            </div>

            <div
              className="absolute bottom-[10%] right-[2%] z-30 flex animate-float items-center gap-3 rounded-2xl bg-ink-900 px-4 py-3 text-ivory-50 shadow-[0_20px_40px_-20px_rgba(15,29,46,0.7)]"
              style={{ animationDelay: "-3s" }}
            >
              <Clock className="h-5 w-5 text-terra-400" aria-hidden="true" />
              <span className="text-sm font-bold">Itinerary in 24 hrs</span>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container-page relative z-10 mt-14 lg:mt-16">
        <Reveal delay={200}>
          <QuickEnquiry />
        </Reveal>
      </div>
    </section>
  );
}
