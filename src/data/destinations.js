import { photos } from "../lib/img";

const destinations = {
  international: [
    { name: "Thailand", region: "Southeast Asia", idealFor: "Couples · Friends · Families", photo: photos.phiPhiView, badge: "Our speciality" },
    { name: "Bali", region: "Indonesia", idealFor: "Honeymoons · Villas", photo: photos.bali },
    { name: "Maldives", region: "Indian Ocean", idealFor: "Honeymoons · Luxury", photo: photos.maldives },
    { name: "Dubai", region: "UAE", idealFor: "Families · Shopping", photo: photos.dubai },
    { name: "Singapore", region: "Southeast Asia", idealFor: "Families · City breaks", photo: photos.singapore },
    { name: "Vietnam", region: "Southeast Asia", idealFor: "Explorers · Food lovers", photo: photos.vietnam },
    { name: "Switzerland", region: "Europe", idealFor: "Scenic rail · Couples", photo: photos.switzerland },
    { name: "Greece", region: "Europe", idealFor: "Island hopping · Couples", photo: photos.santorini },
  ],
  domestic: [
    { name: "Kashmir", region: "North India", idealFor: "Snow · Houseboats", photo: photos.snowPeaks },
    { name: "Kerala", region: "South India", idealFor: "Backwaters · Families", photo: photos.kerala },
    { name: "Ladakh", region: "Himalayas", idealFor: "Road trips · Adventure", photo: photos.ladakh },
    { name: "Golden Triangle", region: "Delhi · Agra · Jaipur", idealFor: "Heritage · First-timers", photo: photos.tajMahal },
    { name: "Goa", region: "West Coast", idealFor: "Beaches · Friends", photo: photos.goaBeach },
    { name: "Andaman", region: "Bay of Bengal", idealFor: "Diving · Honeymoons", photo: photos.sunsetBeach },
  ],
};

export const marqueeDestinations = [
  "Bangkok", "Phuket", "Krabi", "Bali", "Maldives", "Dubai", "Singapore",
  "Kashmir", "Kerala", "Switzerland", "Vietnam", "Goa", "Koh Samui", "Ladakh",
];

export default destinations;
