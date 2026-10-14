import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, ExternalLink, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import PageLoader from "../components/PageLoader";
import { coverSrc, formatDate } from "../lib/blog";
import { deletePost, listPosts } from "./adminApi";
import { useAuth } from "./AuthContext";

const filters = [
  { id: "all", label: "All" },
  { id: "published", label: "Published" },
  { id: "draft", label: "Drafts" },
];

export function StatusBadge({ status }) {
  const published = status === "published";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        published ? "bg-sea-100 text-sea-500" : "bg-sand-300/60 text-ink-600"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${published ? "bg-sea-500" : "bg-ink-400"}`} aria-hidden="true" />
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function AdminPosts() {
  const { expire } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", posts: [], error: "" });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setState((current) => ({ ...current, status: "loading", error: "" }));
    listPosts()
      .then(({ posts }) => setState({ status: "ready", posts, error: "" }))
      .catch((error) => {
        if (error.status === 401) return expire();
        setState({ status: "error", posts: [], error: error.message });
      });
  }, [expire]);

  useEffect(load, [load]);

  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const counts = useMemo(
    () => ({
      all: state.posts.length,
      published: state.posts.filter((post) => post.status === "published").length,
      draft: state.posts.filter((post) => post.status === "draft").length,
    }),
    [state.posts]
  );

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return state.posts.filter(
      (post) =>
        (filter === "all" || post.status === filter) &&
        (!term || post.title.toLowerCase().includes(term) || post.category.toLowerCase().includes(term))
    );
  }, [state.posts, query, filter]);

  const onDelete = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? This can't be undone.`)) return;
    setDeleting(post._id);
    try {
      await deletePost(post._id);
      setState((current) => ({ ...current, posts: current.posts.filter((item) => item._id !== post._id) }));
      setNotice(`Deleted "${post.title}".`);
    } catch (error) {
      if (error.status === 401) return expire();
      window.alert(error.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-serif text-4xl text-ink-900">Blog posts</h1>
          <p className="mt-2 text-ink-600">
            {counts.published} published · {counts.draft} {counts.draft === 1 ? "draft" : "drafts"}
          </p>
        </div>
        <Link to="/admin/posts/new" className="btn-primary self-start sm:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" /> New post
        </Link>
      </div>

      {notice && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-xl bg-sea-100 px-4 py-3 text-sm font-semibold text-sea-500">
          <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> {notice}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div role="tablist" aria-label="Filter posts" className="flex gap-1 rounded-full bg-ivory-200 p-1">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                filter === item.id ? "bg-ivory-50 text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900"
              }`}
            >
              {item.label} <span className="text-ink-400">{counts[item.id]}</span>
            </button>
          ))}
        </div>
        <label className="relative block md:w-80">
          <span className="sr-only">Search posts</span>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title or category"
            className="field py-2.5 pl-11"
          />
        </label>
      </div>

      <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink-900/10 bg-ivory-50">
        {state.status === "loading" && <PageLoader label="Loading posts" className="py-24" />}

        {state.status === "error" && (
          <div role="alert" className="flex flex-col items-center gap-4 py-20 text-center">
            <AlertCircle className="h-6 w-6 text-terra-500" aria-hidden="true" />
            <p className="font-semibold text-ink-900">{state.error}</p>
            <button type="button" onClick={load} className="btn-ghost">
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
            </button>
          </div>
        )}

        {state.status === "ready" && visible.length === 0 && (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl text-ink-900">{state.posts.length ? "No posts match." : "No posts yet."}</p>
            {!state.posts.length && (
              <Link to="/admin/posts/new" className="btn-primary mt-6">
                Write your first post
              </Link>
            )}
          </div>
        )}

        {state.status === "ready" && visible.length > 0 && (
          <ul className="divide-y divide-ink-900/8">
            {visible.map((post) => (
              <li key={post._id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5">
                <img
                  src={coverSrc(post.coverImage, 200, 140)}
                  alt=""
                  loading="lazy"
                  className="hidden h-16 w-24 shrink-0 rounded-xl bg-sand-300 object-cover sm:block"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={post.status} />
                    <span className="text-xs font-semibold text-ink-400">{post.category}</span>
                  </div>
                  <Link to={`/admin/posts/${post._id}`} className="mt-1.5 block truncate font-semibold text-ink-900 hover:text-terra-600">
                    {post.title}
                  </Link>
                  <p className="mt-1 text-xs text-ink-400">
                    {post.status === "published" ? `Published ${formatDate(post.publishedAt)}` : "Not published"} · Updated{" "}
                    {formatDate(post.updatedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {post.status === "published" && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`View "${post.title}" on the site`}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-900/5 hover:text-ink-900"
                    >
                      <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  <Link
                    to={`/admin/posts/${post._id}`}
                    aria-label={`Edit "${post.title}"`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-ink-900/5 hover:text-ink-900"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(post)}
                    disabled={deleting === post._id}
                    aria-label={`Delete "${post.title}"`}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-ink-600 hover:bg-terra-500/10 hover:text-terra-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
