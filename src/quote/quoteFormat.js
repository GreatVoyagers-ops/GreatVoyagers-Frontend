import { coverSrc } from "../lib/blog";
import { photos } from "../lib/img";

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export const rupees = (value) => inr.format(Number(value) || 0);

export const longDate = (value) =>
  value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "";

export function travelDates(quote) {
  if (!quote.startDate) return "";
  const start = new Date(quote.startDate);
  const end = new Date(start);
  end.setDate(end.getDate() + (quote.nights || 0));
  const opts = { day: "numeric", month: "short" };
  return `${start.toLocaleDateString("en-IN", opts)} – ${end.toLocaleDateString("en-IN", { ...opts, year: "numeric" })}`;
}

export const duration = (quote) => `${quote.nights} night${quote.nights === 1 ? "" : "s"} / ${quote.nights + 1} days`;

export const travellers = (quote) =>
  [`${quote.adults} adult${quote.adults === 1 ? "" : "s"}`, quote.children ? `${quote.children} child${quote.children === 1 ? "" : "ren"}` : ""].filter(Boolean).join(", ");

export const quoteRef = (quote) => `Q-${quote.number} v${quote.version}`;

export const shareUrl = (token) => `${window.location.origin}/q/${token}`;

export function shareMessage(quote) {
  const first = (quote.customerName || "").split(" ")[0];
  return [
    `Hi ${first || "there"}, here is your ${quote.destination || "trip"} itinerary and quote from GreatVoyagers`,
    `${quote.title} · ${rupees(quote.totals?.total)}`,
    shareUrl(quote.shareToken),
  ].join("\n\n");
}

export const companyFromSettings = (s) => ({
  name: s.companyName,
  address: s.address,
  phone: s.phone,
  whatsapp: s.whatsapp,
  email: s.email,
  website: s.website,
  gstin: s.gstin,
  bank: s.bank,
  upiId: s.upiId,
});

export const hasBankDetails = (company) => Boolean(company?.bank?.accountNumber || company?.upiId);

export const sizedImage = (url, width, height) => coverSrc(url, width, height);

const PICKS = [
  ["Thailand", "thaiTemple"],
  ["Phuket", "phuketLagoon"],
  ["Krabi", "krabiCliffs"],
  ["Phi Phi", "phiPhiView"],
  ["Bangkok", "bangkokPalace"],
  ["Koh Samui", "samuiCove"],
  ["Bali", "bali"],
  ["Maldives", "maldives"],
  ["Dubai", "dubai"],
  ["Singapore", "singapore"],
  ["Vietnam", "vietnam"],
  ["Switzerland", "switzerland"],
  ["Paris", "paris"],
  ["Santorini", "santorini"],
  ["Kerala", "kerala"],
  ["Ladakh", "ladakh"],
  ["Goa", "goaBeach"],
  ["Taj Mahal", "tajMahal"],
  ["Beach", "sunsetBeach"],
  ["Resort pool", "infinityPool"],
  ["Cruise", "cruisePort"],
  ["Scuba", "scuba"],
];

export const photoPicks = PICKS.map(([label, key]) => ({ label, url: `https://images.unsplash.com/${photos[key]}` }));
