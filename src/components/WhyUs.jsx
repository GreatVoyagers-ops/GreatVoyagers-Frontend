import { Star } from "lucide-react";
import { stats, promises, steps } from "../data/trust";
import { photos, unsplash, unsplashSet } from "../lib/img";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import CountUp from "./CountUp";

export default function WhyUs() {
  return (
    <section id="why-us" className="py-24 md:py-32">
      <div className="container-page">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative order-2 lg:order-1">
            <div className="relative ml-auto aspect-[4/5] w-[82%] overflow-hidden rounded-[2rem]">
              <img
                src={unsplash(photos.resortPool, 800, 1000)}
                srcSet={unsplashSet(photos.resortPool, [500, 800, 1100], 1.25)}
                sizes="(min-width: 1024px) 38vw, 80vw"
                alt="Resort pool with sun loungers and a wooden villa"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-10 left-0 w-[46%] overflow-hidden rounded-[1.5rem] border-[6px] border-ivory-100 shadow-[0_30px_60px_-30px_rgba(15,29,46,0.6)]">
              <img
                src={unsplash(photos.padThai, 500, 400)}
                srcSet={unsplashSet(photos.padThai, [300, 500, 700], 0.8)}
                sizes="(min-width: 1024px) 18vw, 40vw"
                alt="A plate of pad thai with lime and chilli"
                loading="lazy"
                className="aspect-[5/4] h-full w-full object-cover"
              />
            </div>
            <div className="absolute left-[8%] top-8 flex animate-float items-center gap-3 rounded-2xl bg-ivory-50 px-4 py-3 shadow-[0_20px_40px_-20px_rgba(15,29,46,0.5)]">
              <span className="flex gap-0.5 text-terra-500" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </span>
              <span className="text-sm font-bold text-ink-900">Loved by our travellers</span>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Why GreatVoyagers"
              title="Travel planned with *care,* backed by people you can call."
            />
            <ul className="mt-10 grid gap-7 sm:grid-cols-2">
              {promises.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Reveal as="li" key={item.title} delay={index * 70}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sea-100 text-sea-500">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-ink-900">{item.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{item.text}</p>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </div>

        <dl className="mt-24 grid gap-px overflow-hidden rounded-[2rem] bg-ink-900/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 80} className="flex flex-col bg-ivory-50 p-8 md:p-10">
              <dt className="mt-3 text-sm leading-relaxed text-ink-600">{stat.label}</dt>
              <dd className="order-first font-serif text-5xl text-ink-900 md:text-6xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </dd>
            </Reveal>
          ))}
        </dl>

        <div className="mt-24">
          <SectionHeading align="center" eyebrow="How it works" title="From idea to *itinerary* in four steps." />
          <ol className="relative mt-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            <svg
              aria-hidden="true"
              className="absolute left-[12%] right-[12%] top-8 hidden h-2 text-terra-500 lg:block"
              preserveAspectRatio="none"
              viewBox="0 0 100 2"
            >
              <line x1="0" y1="1" x2="100" y2="1" stroke="currentColor" strokeWidth="2" strokeDasharray="1 3" vectorEffect="non-scaling-stroke" className="animate-dash" />
            </svg>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal as="li" key={step.title} delay={index * 120} className="relative text-center">
                  <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink-900 text-ivory-50 ring-8 ring-ivory-100">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-terra-500 text-xs font-bold">
                      {index + 1}
                    </span>
                  </span>
                  <h3 className="mt-6 font-serif text-2xl text-ink-900">{step.title}</h3>
                  <p className="mx-auto mt-2 max-w-[16rem] text-sm leading-relaxed text-ink-600">{step.text}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
