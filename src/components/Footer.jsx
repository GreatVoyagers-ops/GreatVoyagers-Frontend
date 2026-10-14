import { Link } from "react-router-dom";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import company from "../data/company";
import { thaiDestinations } from "../data/thailand";
import { openEnquiry } from "../lib/enquiry";
import { Logo } from "./Navbar";
import { Emphasis } from "./SectionHeading";

const explore = [
  { label: "Services", to: "/#services" },
  { label: "Destinations", to: "/#destinations" },
  { label: "Trips & packages", to: "/#trips" },
  { label: "Why us", to: "/#why-us" },
  { label: "Reviews", to: "/#reviews" },
  { label: "Travel blog", to: "/blog" },
  { label: "FAQ", to: "/#faq" },
];

export default function Footer() {
  return (
    <footer className="bg-ink-950 text-ivory-50">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-ivory-50/10 py-16 md:flex-row md:items-end md:py-20">
          <h2 className="heading-lg max-w-2xl">
            <Emphasis text="Let's plan your *next journey.*" />
          </h2>
          <button type="button" onClick={() => openEnquiry()} className="btn-primary bg-terra-500 px-7 py-4 hover:bg-terra-400">
            Send an enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ivory-50/60">
              {company.legalName} is a full-service travel company for holidays, flights, hotels, cruises and visas,
              with specialist Thailand tours and DMC services.
            </p>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-terra-400">Explore</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {explore.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-ivory-50/70 transition-colors hover:text-ivory-50">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-terra-400">Thailand</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {thaiDestinations.map((city) => (
                <li key={city.name}>
                  <Link to="/#thailand" className="text-ivory-50/70 transition-colors hover:text-ivory-50">
                    {city.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/#dmc" className="text-ivory-50/70 transition-colors hover:text-ivory-50">
                  DMC services
                </Link>
              </li>
            </ul>
          </div>

          <address className="not-italic lg:col-span-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-terra-400">Contact</h3>
            <ul className="mt-5 space-y-5 text-sm">
              <li>
                <a href={`mailto:${company.email}`} className="flex items-start gap-3 text-ivory-50/80 transition-colors hover:text-ivory-50">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-terra-400" aria-hidden="true" />
                  {company.email}
                </a>
              </li>
              <li>
                <a
                  href={company.office.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 text-ivory-50/80 transition-colors hover:text-ivory-50"
                >
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terra-400" aria-hidden="true" />
                  <span>
                    <span className="block font-bold text-ivory-50">{company.office.label}</span>
                    {company.office.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </span>
                </a>
              </li>
            </ul>
          </address>
        </div>

        <div className="flex flex-col gap-3 border-t border-ivory-50/10 py-8 text-xs text-ivory-50/50 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} {company.legalName} All rights reserved.
          </p>
          <p>Photography via Unsplash</p>
        </div>
      </div>
    </footer>
  );
}
