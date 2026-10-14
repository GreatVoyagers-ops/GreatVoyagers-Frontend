import Hero from "../components/Hero";
import DestinationMarquee from "../components/DestinationMarquee";
import Services from "../components/Services";
import Thailand from "../components/Thailand";
import Destinations from "../components/Destinations";
import TripStyles from "../components/TripStyles";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import JournalTeaser from "../components/JournalTeaser";
import EnquiryForm from "../components/EnquiryForm";
import Faq from "../components/Faq";
import Seo from "../components/Seo";
import company from "../data/company";
import { DEFAULT_OG_IMAGE, SITE_URL } from "../lib/site";

const organization = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: company.name,
  legalName: company.legalName,
  url: SITE_URL,
  email: company.email,
  image: DEFAULT_OG_IMAGE,
  logo: `${SITE_URL}/favicon.svg`,
  description:
    "Full-service travel company for domestic and international holidays, flights, hotels, cruises and visas, specialising in Thailand tours and DMC services.",
  address: {
    "@type": "PostalAddress",
    streetAddress: company.office.lines[0],
    addressLocality: "Noida Extension",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  areaServed: ["IN", "TH"],
};

export default function Home() {
  return (
    <>
      <Seo
        description="GreatVoyagers Pvt. Ltd. plans domestic and international holidays, flights, hotels, cruises and visas, with specialist Thailand tours and DMC services. Send us an enquiry and get a custom itinerary."
        path="/"
        jsonLd={organization}
      />
      <Hero />
      <DestinationMarquee />
      <Services />
      <Thailand />
      <Destinations />
      <TripStyles />
      <WhyUs />
      <Testimonials />
      <JournalTeaser />
      <EnquiryForm />
      <Faq />
    </>
  );
}
