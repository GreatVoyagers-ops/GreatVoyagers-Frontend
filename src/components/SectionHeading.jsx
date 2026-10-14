import Reveal from "./Reveal";

/** `title` may contain one *emphasised* phrase, rendered in terracotta italics. */
export function Emphasis({ text }) {
  const parts = text.split("*");
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <em key={index} className="font-light text-terra-500 italic">
        {part}
      </em>
    ) : (
      <span key={index}>{part}</span>
    )
  );
}

export default function SectionHeading({ eyebrow, title, intro, align = "left", tone = "light", className = "" }) {
  const centered = align === "center";
  return (
    <div className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      {eyebrow && (
        <Reveal as="p" className={`eyebrow ${tone === "dark" ? "text-terra-400" : ""}`}>
          {eyebrow}
        </Reveal>
      )}
      <Reveal as="h2" delay={80} className={`heading-lg mt-5 ${tone === "dark" ? "text-ivory-50" : "text-ink-900"}`}>
        <Emphasis text={title} />
      </Reveal>
      {intro && (
        <Reveal
          as="p"
          delay={160}
          className={`mt-5 text-base leading-relaxed md:text-lg ${tone === "dark" ? "text-ivory-50/70" : "text-ink-600"} ${
            centered ? "mx-auto max-w-2xl" : "max-w-2xl"
          }`}
        >
          {intro}
        </Reveal>
      )}
    </div>
  );
}
