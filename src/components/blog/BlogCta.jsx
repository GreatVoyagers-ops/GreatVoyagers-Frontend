import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import company from "../../data/company";
import { openEnquiry } from "../../lib/enquiry";
import { photos, unsplash } from "../../lib/img";
import { Emphasis } from "../SectionHeading";

export default function BlogCta({ prefill }) {
  return (
    <section className="pb-24 md:pb-32">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-[2.25rem] bg-ink-900 px-8 py-14 text-ivory-50 md:px-16 md:py-20">
          <img
            src={unsplash(photos.phuketLagoon, 1600, 700)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-ink-950 via-ink-950/80 to-ink-950/20" />
          <div className="relative max-w-2xl">
            <p className="eyebrow text-terra-400">Plan it with us</p>
            <h2 className="heading-lg mt-5">
              <Emphasis text="Ready to turn reading into *travelling?*" />
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-ivory-50/75">
              Tell us where you'd like to go. A Thailand specialist will send you a custom itinerary and quote, free and
              with no obligation.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <button type="button" onClick={() => openEnquiry(prefill)} className="btn-primary bg-terra-500 px-7 py-4 hover:bg-terra-400">
                Get a free quote <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
              <p className="flex items-center gap-2 text-sm text-ivory-50/70">
                <Clock className="h-4 w-4 text-terra-400" aria-hidden="true" /> {company.responseTime}
              </p>
              <p className="flex items-center gap-2 text-sm text-ivory-50/70">
                <ShieldCheck className="h-4 w-4 text-terra-400" aria-hidden="true" /> No spam, ever
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
