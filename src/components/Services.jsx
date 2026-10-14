import { ArrowUpRight } from "lucide-react";
import services from "../data/services";
import { unsplash, unsplashSet } from "../lib/img";
import { openEnquiry } from "../lib/enquiry";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

function ServiceCard({ service, index }) {
  const Icon = service.icon;
  const featured = Boolean(service.size);
  const span = { large: "sm:col-span-2 lg:row-span-2", wide: "sm:col-span-2" }[service.size] ?? "";

  return (
    <Reveal as="li" delay={(index % 4) * 80} className={`${span} min-h-[16rem]`}>
      <button
        type="button"
        onClick={() => openEnquiry({ tripType: service.enquiryType })}
        className="img-zoom group relative flex h-full min-h-[16rem] w-full overflow-hidden rounded-[1.75rem] text-left"
        aria-label={`${service.title}: enquire now`}
      >
        <img
          src={unsplash(service.photo, featured ? 1000 : 600, featured ? 900 : 600)}
          srcSet={unsplashSet(service.photo, featured ? [600, 1000, 1400] : [400, 600, 800], featured ? 0.9 : 1)}
          sizes={featured ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span className="absolute inset-0 bg-linear-to-t from-ink-950/85 via-ink-950/25 to-transparent" />

        <span className="relative mt-auto flex w-full flex-col p-6 text-ivory-50 md:p-7">
          <span className="mb-auto" />
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-ivory-50/15 ring-1 ring-ivory-50/30 backdrop-blur-sm">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className={`font-serif ${featured ? "text-3xl md:text-4xl" : "text-2xl"} leading-tight`}>{service.title}</span>
          <span className="mt-2 max-w-md text-sm leading-relaxed text-ivory-50/80">{service.description}</span>
        </span>

        <span className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-ivory-50 text-ink-900 opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        </span>
      </button>
    </Reveal>
  );
}

export default function Services() {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading eyebrow="What we do" title="Everything for your trip, *under one roof.*" />
          <Reveal as="p" delay={160} className="max-w-md text-base leading-relaxed text-ink-600 md:text-lg">
            One team for flights, stays, transfers, visas and experiences, so nothing falls through the cracks.
          </Reveal>
        </div>

        <ul className="mt-14 grid auto-rows-[16rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </ul>
      </div>
    </section>
  );
}
