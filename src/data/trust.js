import { ShieldCheck, BadgeIndianRupee, Headset, PencilRuler, MessageSquareText, FileText, SlidersHorizontal, PlaneTakeoff } from "lucide-react";

export const stats = [
  { value: 6, suffix: "", label: "Thailand regions handled by our DMC team" },
  { value: 24, suffix: "/7", label: "On-trip support while you travel" },
  { value: 100, suffix: "%", label: "Tailor-made itineraries" },
  { value: 24, suffix: " hrs", label: "To get your first itinerary" },
];

export const promises = [
  { title: "Registered company", text: "GreatVoyagers Pvt. Ltd., with an office you can visit in Noida.", icon: ShieldCheck },
  { title: "Clear pricing", text: "Itemised quotes with no hidden charges.", icon: BadgeIndianRupee },
  { title: "Planned around you", text: "No copy-paste packages. Every trip is built from scratch.", icon: PencilRuler },
  { title: "Support on the ground", text: "A real person to call before, during and after your trip.", icon: Headset },
];

export const steps = [
  { title: "Tell us your plan", text: "Fill the enquiry form with where, when and who.", icon: MessageSquareText },
  { title: "Get your itinerary", text: "A detailed plan and quote within 24 hours.", icon: FileText },
  { title: "Fine-tune it", text: "Change hotels, days or activities until it feels right.", icon: SlidersHorizontal },
  { title: "Travel easy", text: "Tickets, vouchers and support, all in one place.", icon: PlaneTakeoff },
];
