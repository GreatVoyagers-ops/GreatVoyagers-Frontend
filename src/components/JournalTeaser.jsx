import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import usePosts from "../hooks/usePosts";
import PostCard, { PostCardSkeleton } from "./blog/PostCard";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function JournalTeaser() {
  const { status, data } = usePosts({ limit: 3 });

  if (status === "error" || (status === "ready" && !data.posts.length)) return null;

  return (
    <section id="journal" className="py-24 md:py-32" aria-labelledby="journal-heading">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="From the journal"
            title="Travel guides from *people who've been there.*"
            intro="Honest advice on visas, seasons, budgets and the best of Thailand, written by our travel team."
          />
          <Reveal delay={200}>
            <Link to="/blog" className="btn-ghost shrink-0">
              Read all articles <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {status === "loading"
            ? Array.from({ length: 3 }, (_, index) => <PostCardSkeleton key={index} />)
            : data.posts.map((post, index) => (
                <Reveal key={post._id} delay={index * 100} className={index === 2 ? "sm:max-lg:hidden" : ""}>
                  <PostCard post={post} />
                </Reveal>
              ))}
        </div>
      </div>
    </section>
  );
}
