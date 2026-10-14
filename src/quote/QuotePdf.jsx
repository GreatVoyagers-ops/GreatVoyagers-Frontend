import { Document, Font, Image, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";
import { duration, hasBankDetails, longDate, quoteRef, rupees, sizedImage, travelDates, travellers } from "./quoteFormat";

const C = {
  ink950: "#0a1420",
  ink900: "#0f1d2e",
  ink800: "#1b2b40",
  ink600: "#3d4c60",
  ink400: "#7a8597",
  ivory50: "#fdfbf7",
  ivory100: "#faf6ef",
  ivory200: "#f3ece0",
  sand300: "#e6d9c3",
  terra400: "#e08a5b",
  terra500: "#c8613f",
  terra600: "#a94d2f",
  line: "#e4ded3",
};

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  const base = `${window.location.origin}/fonts`;
  // The built-in PDF fonts have no ₹ glyph, so everything uses Noto.
  Font.register({
    family: "Noto Sans",
    fonts: [
      { src: `${base}/NotoSans-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/NotoSans-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.register({ family: "Noto Serif", src: `${base}/NotoSerif-Regular.ttf` });
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

const s = StyleSheet.create({
  page: { fontFamily: "Noto Sans", fontSize: 9.5, lineHeight: 1.5, color: C.ink800, backgroundColor: C.ivory50, paddingTop: 44, paddingBottom: 64, paddingHorizontal: 44 },
  coverPage: { fontFamily: "Noto Sans", fontSize: 9.5, lineHeight: 1.5, color: C.ink800, backgroundColor: C.ivory50, paddingBottom: 64 },
  hero: { height: 400, backgroundColor: C.ink900, position: "relative" },
  heroImage: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, width: "100%", height: "100%", objectFit: "cover" },
  heroShade: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.ink950, opacity: 0.5 },
  heroInner: { position: "absolute", left: 44, right: 44, top: 36, bottom: 40, justifyContent: "space-between" },
  brand: { fontFamily: "Noto Serif", fontSize: 18, color: C.ivory50 },
  brandAccent: { color: C.terra400 },
  eyebrowLight: { fontSize: 8, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: C.sand300 },
  heroTitle: { fontFamily: "Noto Serif", fontSize: 32, lineHeight: 1.15, color: C.ivory50, marginTop: 8 },
  heroFor: { fontSize: 12, color: C.ivory50, marginTop: 10, opacity: 0.9 },
  coverBody: { paddingHorizontal: 44, paddingTop: 26 },
  facts: { flexDirection: "row", borderWidth: 1, borderColor: C.line, borderRadius: 8, backgroundColor: C.ivory100 },
  fact: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, borderRightWidth: 1, borderRightColor: C.line },
  factLast: { flex: 1.1, paddingVertical: 12, paddingHorizontal: 12 },
  factLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.ink400 },
  factValue: { fontSize: 10, fontWeight: 700, color: C.ink900, marginTop: 3 },
  factTotal: { fontFamily: "Noto Serif", fontSize: 17, color: C.terra600, marginTop: 1 },
  note: { marginTop: 18, padding: 14, borderRadius: 8, backgroundColor: C.ivory200, fontSize: 10, color: C.ink800 },
  coverLine: { marginTop: 18, fontSize: 9, color: C.ink600 },
  company: { position: "absolute", left: 44, right: 44, bottom: 58 },
  eyebrow: { fontSize: 7.5, fontWeight: 700, letterSpacing: 1.6, textTransform: "uppercase", color: C.terra600 },
  h2: { fontFamily: "Noto Serif", fontSize: 20, color: C.ink900, marginTop: 2, marginBottom: 12 },
  section: { marginBottom: 26 },
  day: { flexDirection: "row", marginBottom: 14, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.line },
  dayLast: { flexDirection: "row", marginBottom: 4 },
  dayBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.ink900, color: C.ivory50, fontSize: 10, fontWeight: 700, textAlign: "center", paddingTop: 5, marginRight: 12 },
  dayBody: { flex: 1 },
  dayLabel: { fontSize: 7, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.ink400 },
  dayTitle: { fontFamily: "Noto Serif", fontSize: 13, color: C.ink900, marginTop: 1 },
  dayText: { marginTop: 4, color: C.ink800 },
  dayImage: { width: 150, height: 100, borderRadius: 6, marginLeft: 14, objectFit: "cover" },
  table: { borderWidth: 1, borderColor: C.line, borderRadius: 6 },
  tr: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.line },
  th: { flexDirection: "row", backgroundColor: C.ivory200 },
  thText: { fontSize: 7.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", color: C.ink600 },
  cell: { paddingVertical: 7, paddingHorizontal: 8 },
  columns: { flexDirection: "row" },
  column: { flex: 1 },
  bulletRow: { flexDirection: "row", marginBottom: 4 },
  bullet: { width: 12, fontWeight: 700 },
  priceBox: { backgroundColor: C.ink950, borderRadius: 8, padding: 18, color: C.ivory50 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  priceLabel: { color: C.sand300 },
  priceTotalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: C.ink600 },
  priceTotal: { fontFamily: "Noto Serif", fontSize: 22, color: C.sand300 },
  validity: { marginTop: 10, fontSize: 8.5, color: C.sand300 },
  payBox: { marginTop: 14, borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 16, backgroundColor: C.ivory100 },
  payRow: { flexDirection: "row", paddingVertical: 2.5 },
  payLabel: { width: 90, color: C.ink600 },
  payValue: { flex: 1, fontWeight: 700, color: C.ink900 },
  small: { fontSize: 8.5, color: C.ink600 },
  terms: { fontSize: 8.5, color: C.ink600, lineHeight: 1.55 },
  footer: { position: "absolute", left: 44, right: 44, bottom: 26, paddingTop: 8, paddingRight: 120, borderTopWidth: 1, borderTopColor: C.line, fontSize: 7.5, color: C.ink400 },
  // A4 is 842pt tall; this lines up with the footer text (bottom: 26 + 8 padding).
  pageNumber: { position: "absolute", left: 44, right: 44, top: 802, textAlign: "right", fontSize: 7.5, color: C.ink400 },
});

function Footer({ company, quote }) {
  const line = [company.name, company.phone, company.email, company.website?.replace(/^https?:\/\//, "")].filter(Boolean).join("  ·  ");
  // Dynamic <Text render> is dropped when bottom-anchored under a page lineHeight or placed in a flex row, so it's top-anchored on its own.
  return (
    <>
      <View style={s.footer} fixed>
        <Text>{line}</Text>
      </View>
      <Text style={s.pageNumber} fixed render={({ pageNumber, totalPages }) => `${quoteRef(quote)}  ·  Page ${pageNumber} of ${totalPages}`} />
    </>
  );
}

function Heading({ eyebrow, title }) {
  return (
    <View wrap={false}>
      <Text style={s.eyebrow}>{eyebrow}</Text>
      <Text style={s.h2}>{title}</Text>
    </View>
  );
}

/** Keeps a heading on the same page as its first item(s); minPresenceAhead isn't reliable for this. */
function WithHeading({ eyebrow, title, lead, children }) {
  return (
    <>
      <View wrap={false}>
        <Heading eyebrow={eyebrow} title={title} />
        {lead}
      </View>
      {children}
    </>
  );
}

function Bullets({ items, mark, color }) {
  return items.map((item, index) => (
    <View key={index} style={s.bulletRow} wrap={false}>
      <Text style={[s.bullet, { color }]}>{mark}</Text>
      <Text style={{ flex: 1 }}>{item}</Text>
    </View>
  ));
}

function BulletSection({ eyebrow, title, items, mark, color }) {
  return (
    <WithHeading eyebrow={eyebrow} title={title} lead={<Bullets items={items.slice(0, 2)} mark={mark} color={color} />}>
      <Bullets items={items.slice(2)} mark={mark} color={color} />
    </WithHeading>
  );
}

function Day({ day, index, last, image }) {
  return (
    <View style={last ? s.dayLast : s.day} wrap={(day.description || "").length > 1400}>
      <Text style={s.dayBadge}>{index + 1}</Text>
      <View style={s.dayBody}>
        <Text style={s.dayLabel}>Day {index + 1}</Text>
        <Text style={s.dayTitle}>{day.title || `Day ${index + 1}`}</Text>
        {day.description ? <Text style={s.dayText}>{day.description}</Text> : null}
      </View>
      {image && <Image src={image} style={s.dayImage} />}
    </View>
  );
}

function QuotePdf({ quote, company, images }) {
  const hasChildren = quote.children > 0;
  const sideBySide = Math.max(quote.inclusions.length, quote.exclusions.length) <= 14;
  const days = quote.days.map((day, index) => <Day key={index} day={day} index={index} last={index === quote.days.length - 1} image={images.days[index]} />);
  const groupFirstDay = (quote.days[0]?.description || "").length <= 1400;
  const terms = (quote.terms || "").split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const bank = company.bank || {};
  const bankRows = [
    ["Account name", bank.accountName],
    ["Account no.", bank.accountNumber],
    ["IFSC", bank.ifsc],
    ["Bank", [bank.bankName, bank.branch].filter(Boolean).join(", ")],
    ["UPI", company.upiId],
  ].filter(([, value]) => value);

  return (
    <Document title={`${quote.title} – ${quoteRef(quote)}`} author={company.name} subject={`Itinerary and quote for ${quote.customerName}`} creator="GreatVoyagers">
      <Page size="A4" style={s.coverPage}>
        <View style={s.hero}>
          {images.cover && <Image src={images.cover} style={s.heroImage} />}
          <View style={s.heroShade} />
          <View style={s.heroInner}>
            <Text style={s.brand}>
              Great<Text style={s.brandAccent}>Voyagers</Text>
            </Text>
            <View>
              <Text style={s.eyebrowLight}>Itinerary & quote · {quoteRef(quote)}</Text>
              <Text style={s.heroTitle}>{quote.title}</Text>
              {quote.customerName && <Text style={s.heroFor}>Prepared for {quote.customerName}</Text>}
            </View>
          </View>
        </View>
        <View style={s.coverBody}>
          <View style={s.facts}>
            {quote.startDate && (
              <View style={s.fact}>
                <Text style={s.factLabel}>Dates</Text>
                <Text style={s.factValue}>{travelDates(quote)}</Text>
              </View>
            )}
            <View style={s.fact}>
              <Text style={s.factLabel}>Duration</Text>
              <Text style={s.factValue}>{duration(quote)}</Text>
            </View>
            <View style={s.fact}>
              <Text style={s.factLabel}>Travellers</Text>
              <Text style={s.factValue}>{travellers(quote)}</Text>
            </View>
            <View style={s.factLast}>
              <Text style={s.factLabel}>Total price</Text>
              <Text style={s.factTotal}>{rupees(quote.totals.total)}</Text>
            </View>
          </View>
          {quote.notes ? <Text style={s.note}>{quote.notes}</Text> : null}
          <Text style={s.coverLine}>
            {quote.validUntil ? `Prices valid until ${longDate(quote.validUntil)}, subject to availability. ` : ""}
            Prepared on {longDate(quote.updatedAt || new Date())}.
          </Text>
        </View>
        <View style={s.company}>
          <Text style={{ fontWeight: 700, color: C.ink900 }}>{company.name}</Text>
          {company.address ? <Text style={s.small}>{company.address}</Text> : null}
          <Text style={s.small}>
            {[company.phone && `Phone ${company.phone}`, company.whatsapp && `WhatsApp ${company.whatsapp}`, company.email, company.gstin && `GSTIN ${company.gstin}`].filter(Boolean).join("  ·  ")}
          </Text>
        </View>
        <Footer company={company} quote={quote} />
      </Page>

      <Page size="A4" style={s.page} wrap>
        {quote.days.length > 0 && (
          <View style={s.section}>
            <WithHeading eyebrow="Day by day" title="Your itinerary" lead={groupFirstDay ? days[0] : null}>
              {groupFirstDay ? days.slice(1) : days}
            </WithHeading>
          </View>
        )}

        {quote.hotels.length > 0 && (
          <View style={s.section} wrap={quote.hotels.length > 12}>
            <Heading eyebrow="Where you'll stay" title="Hotels" />
            <View style={s.table}>
              <View style={s.th}>
                <Text style={[s.cell, s.thText, { width: "20%" }]}>City</Text>
                <Text style={[s.cell, s.thText, { width: "34%" }]}>Hotel</Text>
                <Text style={[s.cell, s.thText, { width: "18%" }]}>Room</Text>
                <Text style={[s.cell, s.thText, { width: "10%" }]}>Nights</Text>
                <Text style={[s.cell, s.thText, { width: "18%" }]}>Meals</Text>
              </View>
              {quote.hotels.map((hotel, index) => (
                <View key={index} style={s.tr} wrap={false}>
                  <Text style={[s.cell, { width: "20%" }]}>{hotel.city}</Text>
                  <Text style={[s.cell, { width: "34%", fontWeight: 700, color: C.ink900 }]}>{hotel.name || "To be confirmed"}</Text>
                  <Text style={[s.cell, { width: "18%" }]}>{hotel.roomType}</Text>
                  <Text style={[s.cell, { width: "10%" }]}>{hotel.nights || ""}</Text>
                  <Text style={[s.cell, { width: "18%" }]}>{hotel.mealPlan}</Text>
                </View>
              ))}
            </View>
            <Text style={[s.small, { marginTop: 6 }]}>Hotels are subject to availability; a similar hotel of the same category is booked if one is full.</Text>
          </View>
        )}

        {(quote.inclusions.length > 0 || quote.exclusions.length > 0) && (
          // Flex rows split badly across pages, so short lists stay together and long ones stack.
          <View style={[s.section, sideBySide && s.columns]} wrap={!sideBySide}>
            {quote.inclusions.length > 0 && (
              <View style={sideBySide ? [s.column, { marginRight: quote.exclusions.length > 0 ? 20 : 0 }] : { marginBottom: 16 }}>
                <BulletSection eyebrow="Included" title="What's covered" items={quote.inclusions} mark="+" color="#047857" />
              </View>
            )}
            {quote.exclusions.length > 0 && (
              <View style={sideBySide ? s.column : undefined}>
                <BulletSection eyebrow="Not included" title="What's extra" items={quote.exclusions} mark="–" color={C.ink400} />
              </View>
            )}
          </View>
        )}

        <View style={s.section} wrap={false}>
          <Heading eyebrow="Price" title="Your package price" />
          <View style={s.priceBox}>
            <View style={s.priceRow}>
              <Text style={s.priceLabel}>
                {quote.adults} adult{quote.adults === 1 ? "" : "s"} × {rupees(quote.pricing.perAdult)}
              </Text>
              <Text>{rupees(quote.adults * quote.pricing.perAdult)}</Text>
            </View>
            {hasChildren && (
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>
                  {quote.children} child{quote.children === 1 ? "" : "ren"} × {rupees(quote.pricing.perChild)}
                </Text>
                <Text>{rupees(quote.children * quote.pricing.perChild)}</Text>
              </View>
            )}
            {(quote.totals.gst > 0 || quote.totals.tcs > 0) && (
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>Subtotal</Text>
                <Text>{rupees(quote.totals.subtotal)}</Text>
              </View>
            )}
            {quote.totals.gst > 0 && (
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>GST ({quote.pricing.gstPercent}%)</Text>
                <Text>{rupees(quote.totals.gst)}</Text>
              </View>
            )}
            {quote.totals.tcs > 0 && (
              <View style={s.priceRow}>
                <Text style={s.priceLabel}>TCS ({quote.pricing.tcsPercent}%)</Text>
                <Text>{rupees(quote.totals.tcs)}</Text>
              </View>
            )}
            <View style={s.priceTotalRow}>
              <Text style={{ fontWeight: 700 }}>Total</Text>
              <Text style={s.priceTotal}>{rupees(quote.totals.total)}</Text>
            </View>
            {quote.validUntil && <Text style={s.validity}>Prices valid until {longDate(quote.validUntil)}, subject to availability at the time of booking.</Text>}
          </View>

          {hasBankDetails(company) && (
            <View style={s.payBox}>
              <Text style={[s.eyebrow, { marginBottom: 6 }]}>How to pay</Text>
              {bankRows.map(([label, value]) => (
                <View key={label} style={s.payRow}>
                  <Text style={s.payLabel}>{label}</Text>
                  <Text style={s.payValue}>{value}</Text>
                </View>
              ))}
              <Text style={[s.small, { marginTop: 6 }]}>Please share the payment screenshot with us on WhatsApp so we can confirm your booking.</Text>
            </View>
          )}
        </View>

        {terms.length > 0 ? (
          <View style={s.section}>
            <WithHeading eyebrow="Good to know" title="Terms & cancellation" lead={terms[0].length <= 900 ? <Text style={s.terms}>{terms[0]}</Text> : null}>
              {terms.slice(terms[0].length <= 900 ? 1 : 0).map((paragraph, index) => (
                <Text key={index} style={[s.terms, { marginTop: 6 }]}>
                  {paragraph}
                </Text>
              ))}
            </WithHeading>
          </View>
        ) : null}

        <Footer company={company} quote={quote} />
      </Page>
    </Document>
  );
}

/** Loads a remote photo and re-encodes it as JPEG, since the PDF renderer can't read WebP/AVIF. Returns null on failure. */
async function loadJpeg(url, width, height) {
  if (!url) return null;
  try {
    const response = await fetch(sizedImage(url, width, height), { mode: "cors" });
    if (!response.ok) return null;
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

export async function renderQuotePdf(quote, company) {
  registerFonts();
  const details = { name: "GreatVoyagers", ...(company || {}) };
  const [cover, ...days] = await Promise.all([loadJpeg(quote.coverImage, 1240, 840), ...quote.days.map((day) => loadJpeg(day.image, 480, 320))]);
  return pdf(<QuotePdf quote={quote} company={details} images={{ cover, days }} />).toBlob();
}
