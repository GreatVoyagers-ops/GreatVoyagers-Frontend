import { useEffect, useRef, useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, LoaderCircle, Mail, MapPin, ShieldCheck } from "lucide-react";
import company from "../data/company";
import { photos, unsplash, unsplashSet } from "../lib/img";
import { ENQUIRE_EVENT, budgets, takePendingPrefill, tripTypes } from "../lib/enquiry";
import sendEnquiry, { EnquiryNotConfiguredError } from "../lib/sendEnquiry";
import { Emphasis } from "./SectionHeading";
import Reveal from "./Reveal";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  destination: "",
  tripType: "",
  travelDate: "",
  duration: "",
  adults: "2",
  children: "0",
  budget: "",
  message: "",
  botcheck: false,
};

const adultOptions = ["1", "2", "3", "4", "5", "6", "7", "8", "10+", "20+"];
const childOptions = ["0", "1", "2", "3", "4", "5+"];
const durations = ["2-3 nights", "4-5 nights", "6-7 nights", "8-10 nights", "11+ nights", "Not sure yet"];

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) errors.email = "Please enter a valid email address.";
  const digits = values.phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) errors.phone = "Please enter a valid phone number with country code.";
  if (!values.destination.trim()) errors.destination = "Where would you like to go?";
  if (!values.tripType) errors.tripType = "Please choose a trip type.";
  return errors;
}

function Field({ id, label, required, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-bold text-ink-800">
        {label}
        {required ? <span className="text-terra-500"> *</span> : <span className="font-medium text-ink-400"> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-terra-600">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      )}
    </div>
  );
}

export default function EnquiryForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [highlight, setHighlight] = useState([]);
  const nameRef = useRef(null);
  const successRef = useRef(null);

  useEffect(() => {
    const onPrefill = (event) => {
      const prefill = Object.fromEntries(Object.entries(event.detail ?? {}).filter(([, v]) => v));
      setStatus((current) => (current === "success" ? "idle" : current));
      if (Object.keys(prefill).length) {
        setValues((current) => ({ ...current, ...prefill }));
        setErrors((current) => {
          const next = { ...current };
          Object.keys(prefill).forEach((key) => delete next[key]);
          return next;
        });
        setHighlight(Object.keys(prefill));
        window.setTimeout(() => setHighlight([]), 1800);
      }
      window.setTimeout(() => nameRef.current?.focus({ preventScroll: true }), 700);
    };
    window.addEventListener(ENQUIRE_EVENT, onPrefill);
    const pending = takePendingPrefill();
    if (pending) onPrefill({ detail: pending });
    return () => window.removeEventListener(ENQUIRE_EVENT, onPrefill);
  }, []);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  };

  const fieldProps = (name) => ({
    id: `enquiry-${name}`,
    name,
    value: values[name],
    onChange: update,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `enquiry-${name}-error` : undefined,
    className: `field ${highlight.includes(name) ? "border-terra-500 bg-terra-400/10" : ""}`,
  });

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      document.getElementById(`enquiry-${firstInvalid}`)?.focus();
      return;
    }

    setStatus("sending");
    setErrorMessage("");
    try {
      await sendEnquiry(values);
      setStatus("success");
    } catch (error) {
      setErrorMessage(
        error instanceof EnquiryNotConfiguredError
          ? "Our enquiry form is being set up."
          : "Something went wrong while sending your enquiry."
      );
      setStatus("error");
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setStatus("idle");
  };

  return (
    <section id="enquiry" className="bg-ink-900 py-24 md:py-32">
      <div className="container-page">
        <div className="grid overflow-hidden rounded-[2.25rem] bg-ivory-50 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.6)] lg:grid-cols-12">
          <aside className="relative overflow-hidden p-8 text-ivory-50 md:p-12 lg:col-span-5">
            <img
              src={unsplash(photos.sunsetBeach, 900, 1300)}
              srcSet={unsplashSet(photos.sunsetBeach, [500, 900, 1300], 1.4)}
              sizes="(min-width: 1024px) 40vw, 100vw"
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-b from-ink-950/85 via-ink-950/70 to-ink-950/90" />

            <div className="relative flex h-full flex-col">
              <Reveal as="p" className="eyebrow text-terra-400">
                Free trip enquiry
              </Reveal>
              <Reveal as="h2" delay={80} className="heading-lg mt-5">
                <Emphasis text="Tell us about *your trip.*" />
              </Reveal>
              <Reveal as="p" delay={160} className="mt-5 max-w-sm leading-relaxed text-ivory-50/80">
                Share a few details and a travel expert will send you a tailored itinerary and quote. No
                obligation, no spam.
              </Reveal>

              <Reveal as="ol" delay={220} className="mt-10 space-y-5">
                {["We read your enquiry and call or email you", "You get a custom itinerary within 24 hours", "We fine-tune it together until it's perfect"].map(
                  (text, index) => (
                    <li key={text} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-terra-500 text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="pt-1 text-sm leading-relaxed text-ivory-50/90">{text}</span>
                    </li>
                  )
                )}
              </Reveal>

              <div className="mt-auto space-y-4 border-t border-ivory-50/15 pt-8 text-sm lg:mt-14">
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 font-semibold hover:text-terra-400">
                  <Mail className="h-5 w-5 text-terra-400" aria-hidden="true" />
                  {company.email}
                </a>
                <p className="flex items-start gap-3 text-ivory-50/85">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-terra-400" aria-hidden="true" />
                  {company.office.lines.join(", ")}
                </p>
                <p className="flex items-center gap-3 text-ivory-50/85">
                  <Clock className="h-5 w-5 text-terra-400" aria-hidden="true" />
                  {company.responseTime}
                </p>
              </div>
            </div>
          </aside>

          <div className="p-6 sm:p-8 md:p-12 lg:col-span-7">
            {status === "success" ? (
              <div
                ref={successRef}
                tabIndex={-1}
                role="status"
                className="flex h-full min-h-[32rem] flex-col items-center justify-center text-center outline-none"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sea-100 text-sea-500">
                  <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
                </span>
                <h3 className="mt-8 font-serif text-4xl text-ink-900">Thank you, {values.name.split(" ")[0]}!</h3>
                <p className="mt-4 max-w-md leading-relaxed text-ink-600">
                  Your enquiry for <strong className="text-ink-900">{values.destination}</strong> is with our team. We'll
                  get back to you at <strong className="text-ink-900">{values.email}</strong> within 24 hours.
                </p>
                <button type="button" onClick={reset} className="btn-ghost mt-10">
                  Send another enquiry
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate aria-label="Trip enquiry form">
                <input
                  type="checkbox"
                  name="botcheck"
                  checked={values.botcheck}
                  onChange={update}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field id="enquiry-name" label="Full name" required error={errors.name}>
                    <input ref={nameRef} {...fieldProps("name")} autoComplete="name" placeholder="Your name" />
                  </Field>
                  <Field id="enquiry-email" label="Email" required error={errors.email}>
                    <input {...fieldProps("email")} type="email" autoComplete="email" placeholder="you@example.com" />
                  </Field>
                  <Field id="enquiry-phone" label="Phone / WhatsApp" required error={errors.phone} hint="Include country code, e.g. +91">
                    <input {...fieldProps("phone")} type="tel" autoComplete="tel" placeholder="+91 98765 43210" />
                  </Field>
                  <Field id="enquiry-destination" label="Destination" required error={errors.destination}>
                    <input {...fieldProps("destination")} placeholder="e.g. Phuket & Krabi" />
                  </Field>
                  <Field id="enquiry-tripType" label="Trip type" required error={errors.tripType}>
                    <select {...fieldProps("tripType")}>
                      <option value="">Choose one</option>
                      {tripTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field id="enquiry-travelDate" label="Travel month">
                    <input {...fieldProps("travelDate")} type="month" />
                  </Field>
                  <Field id="enquiry-duration" label="Duration">
                    <select {...fieldProps("duration")}>
                      <option value="">Choose one</option>
                      {durations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field id="enquiry-adults" label="Adults" required>
                      <select {...fieldProps("adults")}>
                        {adultOptions.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field id="enquiry-children" label="Children" required>
                      <select {...fieldProps("children")}>
                        {childOptions.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="enquiry-budget" label="Budget per person">
                      <select {...fieldProps("budget")}>
                        <option value="">Choose a range</option>
                        {budgets.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="enquiry-message" label="Anything else we should know?">
                      <textarea
                        {...fieldProps("message")}
                        rows={4}
                        placeholder="Hotel preferences, special occasions, must-see places..."
                        className={`${fieldProps("message").className} resize-y`}
                      />
                    </Field>
                  </div>
                </div>

                {status === "error" && (
                  <div role="alert" className="mt-6 flex items-start gap-3 rounded-2xl bg-terra-400/10 p-4 text-sm text-ink-800">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-terra-600" aria-hidden="true" />
                    <p>
                      {errorMessage} Please try again, or email us directly at{" "}
                      <a href={`mailto:${company.email}`} className="font-bold underline underline-offset-2">
                        {company.email}
                      </a>
                      .
                    </p>
                  </div>
                )}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex items-center gap-2 text-xs text-ink-400">
                    <ShieldCheck className="h-4 w-4 text-sea-500" aria-hidden="true" />
                    Your details are only used to plan your trip.
                  </p>
                  <button type="submit" disabled={status === "sending"} className="btn-primary px-8 py-4 disabled:cursor-wait disabled:opacity-70">
                    {status === "sending" ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send enquiry <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
