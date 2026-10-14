import { marqueeDestinations } from "../data/destinations";

function Row({ hidden }) {
  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {marqueeDestinations.map((name) => (
        <li key={name} className="flex items-center">
          <span className="px-8 font-serif text-3xl font-light italic text-ivory-50 md:text-4xl">{name}</span>
          <span aria-hidden="true" className="text-xl text-terra-400">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function DestinationMarquee() {
  return (
    <section aria-label="Popular destinations" className="group overflow-hidden bg-ink-900 py-7">
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
        <Row />
        <Row hidden />
      </div>
    </section>
  );
}
