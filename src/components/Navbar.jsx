import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, MapPin, Menu, X } from "lucide-react";
import company from "../data/company";
import { openEnquiry } from "../lib/enquiry";

const links = [
  { label: "Services", to: "/#services" },
  { label: "Thailand", to: "/#thailand" },
  { label: "Destinations", to: "/#destinations" },
  { label: "Trips", to: "/#trips" },
  { label: "Why us", to: "/#why-us" },
  { label: "Reviews", to: "/#reviews" },
  { label: "Blog", to: "/blog" },
];

export function Logo({ tone = "dark", to = "/" }) {
  return (
    <Link to={to} className="group flex items-baseline gap-1.5" aria-label={`${company.name} home`}>
      <span className={`font-serif text-2xl font-medium tracking-tight ${tone === "dark" ? "text-ink-900" : "text-ivory-50"}`}>
        Great<em className="font-light text-terra-500">Voyagers</em>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const { pathname } = useLocation();
  const isCurrent = (to) => to === "/blog" && pathname.startsWith("/blog");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      toggleRef.current?.focus();
    };
  }, [open]);

  const enquire = () => {
    setOpen(false);
    openEnquiry();
  };

  return (
    <>
      <div className="hidden bg-ink-900 text-ivory-50/80 md:block">
        <div className="container-page flex h-10 items-center justify-between text-xs font-medium">
          <p>
            <span className="text-terra-400">Thailand specialists & DMC</span>
            <span className="mx-3 text-ivory-50/30">|</span>
            Domestic & international holidays
          </p>
          <div className="flex items-center gap-6">
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 transition-colors hover:text-ivory-50">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {company.email}
            </a>
            <a
              href={company.office.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-2 transition-colors hover:text-ivory-50 lg:flex"
            >
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              Gaur City Mall, Noida Extension
            </a>
          </div>
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled || open
            ? "border-b border-ink-900/8 bg-ivory-100/90 shadow-[0_8px_30px_-20px_rgba(15,29,46,0.35)] backdrop-blur-md"
            : "border-b border-transparent bg-ivory-100"
        }`}
      >
        <div className="container-page flex h-[4.5rem] items-center justify-between gap-6">
          <Logo />

          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-6 xl:gap-8">
              {links.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    aria-current={isCurrent(link.to) ? "page" : undefined}
                    className="group relative text-sm font-semibold text-ink-600 transition-colors hover:text-ink-900 aria-[current=page]:text-ink-900"
                  >
                    {link.label}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1.5 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-terra-500 transition-transform duration-300 group-hover:scale-x-100 group-aria-[current=page]:scale-x-100"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <button type="button" onClick={enquire} className="btn-primary hidden sm:inline-flex">
              Enquire now
            </button>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-900 transition-colors hover:bg-ink-900/5 lg:hidden"
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        inert={!open}
        className={`fixed inset-0 z-40 bg-ivory-100 transition-[opacity,visibility] duration-300 lg:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <nav aria-label="Mobile" className="container-page flex h-full flex-col overflow-y-auto pb-10 pt-24 md:pt-32">
          <ul>
            {links.map((link, index) => (
              <li
                key={link.to}
                className={`border-b border-ink-900/10 transition-all duration-500 ${open ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
                style={{ transitionDelay: open ? `${60 + index * 40}ms` : "0ms" }}
              >
                <Link
                  to={link.to}
                  onClick={() => setOpen(false)}
                  aria-current={isCurrent(link.to) ? "page" : undefined}
                  className="flex items-center justify-between py-4 font-serif text-3xl text-ink-900"
                >
                  {link.label}
                  <span className="text-xs font-sans font-bold tracking-[0.2em] text-terra-500">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" onClick={enquire} className="btn-primary mt-8 w-full py-4">
            Enquire now
          </button>
          <div className="mt-8 space-y-2 text-sm text-ink-600">
            <a href={`mailto:${company.email}`} className="block font-semibold text-ink-900">
              {company.email}
            </a>
            <p>{company.office.lines.join(", ")}</p>
          </div>
        </nav>
      </div>
    </>
  );
}
