export const ENQUIRY_STATUSES = ["New", "Contacted", "Quoted", "Follow-up", "Won", "Lost"];
export const OPEN_STATUSES = ["New", "Contacted", "Quoted", "Follow-up"];
export const ENQUIRY_SOURCES = ["Website", "Phone", "WhatsApp", "Walk-in", "Referral", "B2B / Agent", "Instagram", "Other"];
export const BUSINESS_TYPES = ["DMC", "Visa", "Tour", "Hotel", "Transport", "Flights", "Activities", "Cruise", "Other"];

export const LOST_REASONS = ["Price too high", "Booked elsewhere", "Plans cancelled", "No response", "Dates not available", "Just exploring"];

export const DUE_FILTERS = [
  { id: "", label: "Any follow-up" },
  { id: "due", label: "Due (today + overdue)" },
  { id: "overdue", label: "Overdue" },
  { id: "today", label: "Today" },
  { id: "week", label: "Next 7 days" },
];
