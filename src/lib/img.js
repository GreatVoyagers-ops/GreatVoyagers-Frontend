const BASE = "https://images.unsplash.com";

export function unsplash(id, width, height) {
  const size = height ? `&w=${width}&h=${height}` : `&w=${width}`;
  return `${BASE}/${id}?auto=format&fit=crop&q=75${size}`;
}

export function unsplashSet(id, widths, ratio) {
  return widths
    .map((w) => `${unsplash(id, w, ratio ? Math.round(w * ratio) : undefined)} ${w}w`)
    .join(", ");
}

export const photos = {
  railayLongtails: "photo-1552465011-b4e21bf6e79a",
  thaiTemple: "photo-1528181304800-259b08848526",
  phiPhiView: "photo-1506665531195-3566af2b4dfa",
  bangkokPalace: "photo-1563492065599-3520f775eeed",
  bangkokNight: "photo-1508009603885-50cf7c579365",
  phuketLagoon: "photo-1589394815804-964ed0be2eb5",
  boatsBeach: "photo-1506929562872-bb421503ef21",
  krabiCliffs: "photo-1519451241324-20b4ea2c4220",
  samuiCove: "photo-1537956965359-7573183d1f57",
  mayaBay: "photo-1534008897995-27a23e859048",
  padThai: "photo-1559314809-0d155014e29e",
  bali: "photo-1537996194471-e657df975ab4",
  tropicalBeach: "photo-1512343879784-a960bf40e7f2",
  maldives: "photo-1514282401047-d79a71a590e8",
  paris: "photo-1502602898657-3e91760cbb34",
  singapore: "photo-1525625293386-3f8f99389edd",
  dubai: "photo-1512453979798-5ea266f8880c",
  vietnam: "photo-1528127269322-539801943592",
  switzerland: "photo-1530122037265-a5f1f91d3b99",
  santorini: "photo-1570077188670-e3a8d69ac5ff",
  tajMahal: "photo-1524492412937-b28074a5d7da",
  kerala: "photo-1602216056096-3b40cc0c9944",
  snowPeaks: "photo-1626621341517-bbf3d9990a23",
  ladakh: "photo-1581793745862-99fde7fa73d2",
  goaBeach: "photo-1519046904884-53103b34b206",
  sunsetBeach: "photo-1507525428034-b723cf961d3e",
  roadTrip: "photo-1469854523086-cc02fe5d8800",
  planning: "photo-1488646953014-85cb44e25828",
  planeWing: "photo-1436491865332-7a61a109cc05",
  resortPool: "photo-1566073771259-6a8506099945",
  infinityPool: "photo-1582719508461-905c673771fd",
  nightPool: "photo-1571896349842-33c89424de2d",
  cruisePort: "photo-1548574505-5e239809ee19",
  airportLounge: "photo-1530521954074-e64f6810b32d",
  groupSunset: "photo-1511895426328-dc8714191300",
  concert: "photo-1533174072545-7a4b6ad7a6c3",
  scuba: "photo-1544551763-46a013bb70d5",
  friendsTrek: "photo-1539635278303-d4002c07eae3",
  worldMap: "photo-1524661135-423995f22d0b",
  groupDinner: "photo-1515187029135-18ee286d815b",
  coachNight: "photo-1544620347-c4fd4a3d5957",
};
