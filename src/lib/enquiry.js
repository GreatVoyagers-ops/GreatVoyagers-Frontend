import { navigateTo, scrollToId } from "./navigation";

export const ENQUIRE_EVENT = "gv:enquire";

export const tripTypes = [
  "Holiday package",
  "Honeymoon",
  "Family vacation",
  "Group tour",
  "Bachelor / party trip",
  "Cruise",
  "Corporate / MICE",
  "Flights only",
  "Hotels only",
  "Visa assistance",
  "Airport transfers",
  "Activities & experiences",
  "B2B / DMC enquiry",
  "Something else",
];

export const budgets = [
  "Under ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000 – ₹2,50,000",
  "₹2,50,000 – ₹5,00,000",
  "Above ₹5,00,000",
  "Not sure yet",
];

let pendingPrefill = null;

/** Returns (and clears) a prefill saved while navigating to the form from another page. */
export function takePendingPrefill() {
  const prefill = pendingPrefill;
  pendingPrefill = null;
  return prefill;
}

/** Pre-fills the enquiry form (any subset of its fields) and scrolls to it, navigating home if needed. */
export function openEnquiry(prefill = {}) {
  if (!document.getElementById("enquiry")) {
    pendingPrefill = prefill;
    navigateTo("/#enquiry");
    return;
  }
  window.dispatchEvent(new CustomEvent(ENQUIRE_EVENT, { detail: prefill }));
  scrollToId("enquiry");
}
