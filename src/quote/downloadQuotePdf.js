/** Builds the quote PDF in the browser (the renderer is loaded on demand) and saves it. */
export async function downloadQuotePdf(quote, company) {
  const { renderQuotePdf } = await import("./QuotePdf.jsx");
  const blob = await renderQuotePdf(quote, company);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const slug = (quote.destination || "trip").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "");
  link.href = url;
  link.download = `GreatVoyagers-${slug}-Q${quote.number}-v${quote.version}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}
