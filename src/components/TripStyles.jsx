import { ArrowRight } from "lucide-react";
import tripStyles from "../data/tripStyles";
import { unsplash, unsplashSet } from "../lib/img";
import { openEnquiry } from "../lib/enquiry";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";

export default function TripStyles() {
  return (
    <section id="trips" className="bg-ivory-200 py-24 md:py-32">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Trips & packages"
          title="A trip for every *kind of traveller.*"
          intro="Tell us who's travelling and what you love. We'll shape the pace, the stays and the experiences around it."
        />

        <ul className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tripStyles.map((style, index) => (
            <Reveal as="li" key={style.id} delay={(index % 3) * 90}>
              <button
                type="button"
                onClick={() => openEnquiry({ tripType: style.enquiryType })}
                className="img-zoom group relative block h-[26rem] w-full overflow-hidden rounded-[2rem] text-left"
                aria-label={`${style.title}: plan this trip`}
              >
                <img
                  src={unsplash(style.photo, 700, 900)}
                  srcSet={unsplashSet(style.photo, [450, 700, 950], 1.3)}
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw"
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-linear-to-t from-ink-950/90 via-ink-950/20 to-transparent transition-opacity duration-500" />
                <span className="absolute left-6 top-6 font-serif text-lg italic text-ivory-50/80">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="absolute inset-x-0 bottom-0 p-7">
                  <span className="block font-serif text-3xl leading-tight text-ivory-50">{style.title}</span>
                  <span className="mt-3 block text-sm leading-relaxed text-ivory-50/80 transition-all duration-500 lg:max-h-0 lg:translate-y-3 lg:overflow-hidden lg:opacity-0 lg:group-hover:max-h-24 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-focus-visible:max-h-24 lg:group-focus-visible:opacity-100">
                    {style.text}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-ivory-50/15 px-4 py-2 text-sm font-bold text-ivory-50 ring-1 ring-ivory-50/30 backdrop-blur-sm transition-colors duration-300 group-hover:bg-terra-500 group-hover:ring-terra-500">
                    Plan this trip <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
