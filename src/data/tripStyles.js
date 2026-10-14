import { photos } from "../lib/img";

const tripStyles = [
  {
    id: "honeymoon",
    enquiryType: "Honeymoon",
    title: "Honeymoon",
    text: "Private villas, candlelit dinners and slow mornings, planned for two.",
    photo: photos.maldives,
  },
  {
    id: "family",
    enquiryType: "Family vacation",
    title: "Family Vacations",
    text: "Kid-friendly hotels, easy transfers and days that work for every age.",
    photo: photos.groupSunset,
  },
  {
    id: "group",
    enquiryType: "Group tour",
    title: "Group Tours",
    text: "Fixed departures and private groups, with one person handling it all.",
    photo: photos.friendsTrek,
  },
  {
    id: "bachelor",
    enquiryType: "Bachelor / party trip",
    title: "Bachelor & Party Trips",
    text: "Pool parties, nightlife and island days in Thailand, Goa and beyond.",
    photo: photos.concert,
  },
  {
    id: "cruise",
    enquiryType: "Cruise",
    title: "Cruise Holidays",
    text: "Ocean cruises with the flights and hotel nights arranged around them.",
    photo: photos.cruisePort,
  },
  {
    id: "corporate",
    enquiryType: "Corporate / MICE",
    title: "Corporate & MICE",
    text: "Offsites, incentive trips and conferences, handled end to end.",
    photo: photos.groupDinner,
  },
];

export default tripStyles;
