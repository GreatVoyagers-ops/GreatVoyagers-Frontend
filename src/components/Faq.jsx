import { Plus } from "lucide-react";
import faqs from "../data/faqs";
import company from "../data/company";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function Faq() {
  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionHeading eyebrow="FAQ" title="Questions, *answered.*" />
          <Reveal as="p" delay={160} className="mt-6 max-w-sm text-base leading-relaxed text-ink-600">
            Can't find what you're looking for? Write to us at{" "}
            <a href={`mailto:${company.email}`} className="font-bold text-ink-900 underline decoration-terra-500 underline-offset-4">
              {company.email}
            </a>
            .
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          {faqs.map((item, index) => (
            <Reveal key={item.q} delay={index * 50}>
              <details className="group border-b border-ink-900/12 py-2 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-lg py-5 text-left text-lg font-bold text-ink-900">
                  {item.q}
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-900/15 transition-all duration-300 group-open:rotate-45 group-open:border-terra-500 group-open:bg-terra-500 group-open:text-ivory-50">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-12 leading-relaxed text-ink-600">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
