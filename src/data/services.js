import { Plane, Hotel, Map, Palmtree, Ship, Sparkles, FileCheck, Car } from "lucide-react";
import { photos } from "../lib/img";

const services = [
  {
    id: "holidays",
    enquiryType: "Holiday package",
    title: "Holiday Packages",
    description: "Complete trips with flights, stays, transfers and sightseeing planned around you.",
    icon: Palmtree,
    photo: photos.tropicalBeach,
    size: "large",
  },
  {
    id: "tours",
    enquiryType: "Group tour",
    title: "Domestic & International Tours",
    description: "Guided group departures and private tours across India and the world.",
    icon: Map,
    photo: photos.roadTrip,
    size: "wide",
  },
  {
    id: "flights",
    enquiryType: "Flights only",
    title: "Flight Bookings",
    description: "The right routes at the right fares, domestic and international.",
    icon: Plane,
    photo: photos.planeWing,
  },
  {
    id: "hotels",
    enquiryType: "Hotels only",
    title: "Hotels & Resorts",
    description: "Handpicked stays, from city hotels to private pool villas.",
    icon: Hotel,
    photo: photos.infinityPool,
  },
  {
    id: "cruises",
    enquiryType: "Cruise",
    title: "Cruises",
    description: "Ocean and island cruises with cabins chosen for you.",
    icon: Ship,
    photo: photos.cruisePort,
  },
  {
    id: "experiences",
    enquiryType: "Activities & experiences",
    title: "Activities & Experiences",
    description: "Island hopping, diving, shows, food trails and more.",
    icon: Sparkles,
    photo: photos.scuba,
  },
  {
    id: "visa",
    enquiryType: "Visa assistance",
    title: "Visa Assistance",
    description: "Documents checked, forms filed and appointments handled.",
    icon: FileCheck,
    photo: photos.worldMap,
  },
  {
    id: "transfers",
    enquiryType: "Airport transfers",
    title: "Airport Transfers",
    description: "Private and shared transfers waiting when you land.",
    icon: Car,
    photo: photos.airportLounge,
  },
];

export default services;
