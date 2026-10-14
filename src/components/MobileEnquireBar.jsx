import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { openEnquiry } from "../lib/enquiry";

export default function MobileEnquireBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const form = document.getElementById("enquiry");
    let pastHero = false;
    let formInView = false;
    const update = () => setVisible(pastHero && !formInView);

    const onScroll = () => {
      pastHero = window.scrollY > window.innerHeight * 0.8;
      update();
    };
    const observer = new IntersectionObserver(([entry]) => {
      formInView = entry.isIntersecting;
      update();
    });
    if (form) observer.observe(form);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 p-3 transition-all duration-500 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <button type="button" onClick={() => openEnquiry()} className="btn-primary w-full py-4 shadow-[0_15px_40px_-10px_rgba(15,29,46,0.5)]">
        Enquire now — free quote
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
