import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Seo from "../components/Seo";
import PageLoader from "../components/PageLoader";
import { api } from "../lib/api";
import QuoteDocument from "../quote/QuoteDocument";
import { downloadQuotePdf } from "../quote/downloadQuotePdf";

export default function QuoteView() {
  const { token } = useParams();
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api(`/quotes/${encodeURIComponent(token)}`, { signal: controller.signal })
      .then((data) => setState({ status: "ready", data, error: "" }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ status: "error", data: null, error: error.message });
      });
    return () => controller.abort();
  }, [token]);

  const onDownload = async () => {
    setDownloading(true);
    setDownloadError("");
    try {
      await downloadQuotePdf(state.data.quote, state.data.company);
    } catch {
      setDownloadError("Couldn't create the PDF on this device. You can still view or print this page.");
    }
    setDownloading(false);
  };

  if (state.status === "loading") {
    return (
      <>
        <Seo title="Your quote | GreatVoyagers" noindex />
        <PageLoader label="Loading your quote" className="min-h-screen" />
      </>
    );
  }

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ivory-50 px-6">
        <Seo title="Quote not available | GreatVoyagers" noindex />
        <div className="max-w-md text-center">
          <p className="font-serif text-2xl text-ink-900">
            Great<em className="font-light text-terra-500">Voyagers</em>
          </p>
          <h1 className="mt-6 font-serif text-3xl text-ink-900">Quote not available</h1>
          <p className="mt-3 text-ink-600">{state.error}</p>
          <a href="/" className="btn-primary mt-6 inline-flex">
            Visit our website
          </a>
        </div>
      </main>
    );
  }

  const { quote, company } = state.data;
  return (
    <>
      <Seo title={`${quote.title} | GreatVoyagers`} noindex>
        <meta name="referrer" content="no-referrer" />
      </Seo>
      {downloadError && (
        <p role="alert" className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md rounded-xl bg-ink-950 px-4 py-3 text-sm text-ivory-50 shadow-lg">
          {downloadError}
        </p>
      )}
      <QuoteDocument quote={quote} company={company} onDownload={onDownload} downloading={downloading} />
    </>
  );
}
