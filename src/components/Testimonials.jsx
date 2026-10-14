import { Quote, Star } from "lucide-react";
import testimonials from "../data/testimonials";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

function initials(name) {
  return name
    .split(/[\s&,]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Testimonials() {
  return (
    <section id="reviews" className="relative overflow-hidden bg-ivory-200 py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Traveller stories"
          title="Trips people *still talk about.*"
          intro="Honeymooners, families, groups of friends and travel partners. Here's what they had to say."
        />

        <ul className="mt-14 columns-1 gap-5 md:columns-2 lg:columns-3">
          {testimonials.map((item, index) => (
            <Reveal
              as="li"
              key={item.name}
              delay={(index % 3) * 90}
              className={`mb-5 break-inside-avoid rounded-[1.75rem] p-7 md:p-8 ${
                index === 1 ? "bg-ink-900 text-ivory-50" : "bg-ivory-50 text-ink-900"
              }`}
            >
              <figure>
                <div className="flex items-center justify-between">
                  <span className="flex gap-0.5 text-terra-500" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                    ))}
                  </span>
                  <Quote className={`h-8 w-8 ${index === 1 ? "text-ivory-50/20" : "text-ink-900/10"}`} aria-hidden="true" />
                </div>
                <blockquote className="mt-5 font-serif text-xl leading-snug">“{item.quote}”</blockquote>
                <figcaption className="mt-7 flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      index === 1 ? "bg-terra-500 text-ivory-50" : "bg-sand-300 text-ink-900"
                    }`}
                  >
                    {initials(item.name)}
                  </span>
                  <span>
                    <span className="block font-bold">{item.name}</span>
                    <span className={`block text-sm ${index === 1 ? "text-ivory-50/65" : "text-ink-600"}`}>
                      {item.trip} · {item.place}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
