import { api } from "./api";

const ENDPOINT = "https://api.web3forms.com/submit";

export class EnquiryNotConfiguredError extends Error {}

function formatMonth(value) {
  if (!value) return "Flexible";
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

/** Emails the enquiry through Web3Forms, which forwards it to the inbox the access key was registered with. */
async function emailEnquiry(values) {
  const accessKey = import.meta.env.VITE_WEB3FORMS_KEY;
  if (!accessKey) {
    throw new EnquiryNotConfiguredError("Enquiry form is not configured yet.");
  }

  const payload = {
    access_key: accessKey,
    subject: `New enquiry: ${values.destination} (${values.tripType}) from ${values.name}`,
    from_name: "GreatVoyagers Website",
    replyto: values.email,
    botcheck: values.botcheck,
    Name: values.name,
    Email: values.email,
    Phone: values.phone,
    Destination: values.destination,
    "Trip type": values.tripType,
    "Travel month": formatMonth(values.travelDate),
    Duration: values.duration || "Not specified",
    Travellers: `${values.adults} adult(s), ${values.children} child(ren)`,
    Budget: values.budget || "Not specified",
    Message: values.message || "-",
  };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Could not send your enquiry.");
  }
  return result;
}

/** Saves the enquiry in the CRM so the sales team can track it. */
function saveEnquiry(values) {
  return api("/enquiries", { method: "POST", body: values });
}

/**
 * Sends the enquiry to the inbox and the CRM at the same time. It counts as sent when either succeeds,
 * so a visitor is never told to retry because one of the two is down.
 */
export default async function sendEnquiry(values) {
  const [email, crm] = await Promise.allSettled([emailEnquiry(values), saveEnquiry(values)]);
  if (email.status === "fulfilled" || crm.status === "fulfilled") {
    if (email.status === "rejected") console.warn("Enquiry email failed:", email.reason);
    if (crm.status === "rejected") console.warn("Enquiry was not saved to the CRM:", crm.reason);
    return { emailed: email.status === "fulfilled", saved: crm.status === "fulfilled" };
  }
  throw email.reason instanceof EnquiryNotConfiguredError ? crm.reason : email.reason;
}
