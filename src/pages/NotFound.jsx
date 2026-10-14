import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Seo from "../components/Seo";
import { Emphasis } from "../components/SectionHeading";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[70vh] flex-col items-start justify-center py-24">
      <Seo title="Page not found | GreatVoyagers" description="The page you were looking for doesn't exist." noindex />
      <p className="eyebrow">Error 404</p>
      <h1 className="heading-xl mt-5 max-w-3xl">
        <Emphasis text="This page has *wandered off.*" />
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-600">
        The link may be old or mistyped. Let's get you back on track.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/" className="btn-primary">
          Back to home <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link to="/blog" className="btn-ghost">
          Read the travel blog
        </Link>
      </div>
    </section>
  );
}
