import { BedDouble, Bus, Compass, Users, UserRound, Headset } from "lucide-react";
import { photos } from "../lib/img";

export const thaiDestinations = [
  {
    name: "Bangkok",
    note: "Temples, rooftops & street food",
    photo: photos.bangkokPalace,
  },
  {
    name: "Phuket",
    note: "Beaches, nightlife & island days",
    photo: photos.phuketLagoon,
  },
  {
    name: "Krabi",
    note: "Limestone cliffs & longtail boats",
    photo: photos.krabiCliffs,
  },
  {
    name: "Phi Phi Islands",
    note: "Maya Bay & crystal lagoons",
    photo: photos.mayaBay,
  },
  {
    name: "Koh Samui",
    note: "Quiet coves & villa stays",
    photo: photos.samuiCove,
  },
  {
    name: "Pattaya",
    note: "Coral Island & family fun",
    photo: photos.boatsBeach,
  },
];

export const dmcServices = [
  { title: "Hotel contracting", text: "Negotiated rates across Bangkok, Phuket, Krabi, Pattaya and Samui.", icon: BedDouble },
  { title: "Ground handling", text: "Airport meet & greet, private and coach transfers.", icon: Bus },
  { title: "Tours & activities", text: "Island tours, city tours, shows and adventure activities.", icon: Compass },
  { title: "Groups & MICE", text: "Incentive groups, conferences, weddings and events.", icon: Users },
  { title: "Local guides", text: "English and Hindi speaking guides on request.", icon: UserRound },
  { title: "24/7 local operations", text: "A team on the ground while your travellers are there.", icon: Headset },
];
