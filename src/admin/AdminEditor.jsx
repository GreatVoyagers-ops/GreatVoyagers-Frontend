import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Bold,
  CheckCircle2,
  ExternalLink,
  Heading2,
  Heading3,
  ImageOff,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Quote,
} from "lucide-react";
import PageLoader from "../components/PageLoader";
import { coverSrc } from "../lib/blog";
import renderMarkdown from "../lib/renderMarkdown";
import { SITE_URL } from "../lib/site";
import { createPost, getPost, listPosts, updatePost } from "./adminApi";
import { useAuth } from "./AuthContext";
import { StatusBadge } from "./AdminPosts";

const DEFAULT_CATEGORIES = [
  "Thailand Guides",
  "Travel Tips",
  "Honeymoon",
  "Family Travel",
  "Group Travel",
  "Destination Comparisons",
  "For Travel Agents",
];

const EMPTY = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  coverAlt: "",
  category: "",
  tags: "",
  author: "GreatVoyagers Team",
  status: "draft",
  publishedAt: "",
  metaTitle: "",
  metaDescription: "",
};

const toSlug = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 100);

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : "");

const fromPost = (post) => ({
  ...EMPTY,
  ...Object.fromEntries(Object.keys(EMPTY).map((key) => [key, post[key] ?? EMPTY[key]])),
  tags: (post.tags || []).join(", "),
  publishedAt: toDateInput(post.publishedAt),
});

const toPayload = (form, status) => ({
  ...form,
  status,
  slug: form.slug.replace(/^-+|-+$/g, ""),
  tags: form.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
  publishedAt: form.publishedAt ? new Date(`${form.publishedAt}T09:00:00`).toISOString() : null,
});

function validate(form) {
  const errors = {};
  if (form.title.trim().length < 3) errors.title = "Add a title (at least 3 characters).";
  if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*-*$/.test(form.slug)) errors.slug = "Use lowercase letters, numbers and hyphens only.";
  if (form.excerpt.trim().length < 20) errors.excerpt = "Write a short summary (at least 20 characters).";
  if (form.content.trim().length < 50) errors.content = "The article needs at least 50 characters.";
  if (!/^https?:\/\/\S+$/i.test(form.coverImage.trim())) errors.coverImage = "Paste a full image URL starting with https://";
  if (form.category.trim().length < 2) errors.category = "Choose or type a category.";
  if (form.metaTitle.length > 70) errors.metaTitle = "Keep the SEO title under 70 characters.";
  if (form.metaDescription.length > 170) errors.metaDescription = "Keep the meta description under 170 characters.";
  return errors;
}

const toolbar = [
  { label: "Heading", icon: Heading2, prefix: "## ", line: true },
  { label: "Subheading", icon: Heading3, prefix: "### ", line: true },
  { label: "Bold", icon: Bold, wrap: "**" },
  { label: "Italic", icon: Italic, wrap: "_" },
  { label: "Link", icon: Link2, link: true },
  { label: "Bulleted list", icon: List, prefix: "- ", line: true },
  { label: "Numbered list", icon: ListOrdered, prefix: "1. ", line: true },
  { label: "Quote", icon: Quote, prefix: "> ", line: true },
];

function Field({ id, label, hint, error, counter, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-bold text-ink-900">
          {label}
        </label>
        {counter}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs font-semibold text-terra-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>
      )}
    </div>
  );
}

function Counter({ value, ideal, max }) {
  const length = value.length;
  const tone = length > max ? "text-terra-600" : length > ideal ? "text-sand-500" : "text-ink-400";
  return (
    <span className={`text-xs font-semibold tabular-nums ${tone}`}>
      {length}/{ideal}
    </span>
  );
}

export default function AdminEditor() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const { expire } = useAuth();
  const contentRef = useRef(null);

  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(EMPTY);
  const [post, setPost] = useState(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loadState, setLoadState] = useState(isNew ? "ready" : "loading");
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState("");
  const [message, setMessage] = useState(null);
  const [tab, setTab] = useState("write");
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [coverBroken, setCoverBroken] = useState(false);

  useEffect(() => {
    listPosts()
      .then(({ posts }) => setCategories([...new Set([...DEFAULT_CATEGORIES, ...posts.map((item) => item.category)])].sort()))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) {
      setForm(EMPTY);
      setSaved(EMPTY);
      setPost(null);
      setSlugTouched(false);
      setLoadState("ready");
      return;
    }
    let active = true;
    setLoadState("loading");
    getPost(id)
      .then(({ post: loaded }) => {
        if (!active) return;
        const values = fromPost(loaded);
        setPost(loaded);
        setForm(values);
        setSaved(values);
        setSlugTouched(true);
        setLoadState("ready");
      })
      .catch((error) => {
        if (!active) return;
        if (error.status === 401) return expire();
        setLoadError(error.message);
        setLoadState("error");
      });
    return () => {
      active = false;
    };
  }, [id, isNew, expire]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  useEffect(() => setCoverBroken(false), [form.coverImage]);

  const preview = useMemo(() => (tab === "preview" ? renderMarkdown(form.content) : ""), [tab, form.content]);
  const words = useMemo(() => form.content.trim().split(/\s+/).filter(Boolean).length, [form.content]);

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugTouched) next.slug = toSlug(value);
      return next;
    });
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  };

  const applyFormat = (tool) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart: start, selectionEnd: end, value } = textarea;
    const selected = value.slice(start, end);
    let insert;
    let cursorStart;
    let cursorEnd;

    if (tool.wrap) {
      const text = selected || "text";
      insert = `${tool.wrap}${text}${tool.wrap}`;
      cursorStart = start + tool.wrap.length;
      cursorEnd = cursorStart + text.length;
    } else if (tool.link) {
      const text = selected || "link text";
      insert = `[${text}](https://)`;
      cursorStart = start + text.length + 3;
      cursorEnd = cursorStart + 8;
    } else {
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const block = value.slice(lineStart, end) || "";
      const prefixed = block
        .split("\n")
        .map((line) => `${tool.prefix}${line}`)
        .join("\n");
      const next = value.slice(0, lineStart) + prefixed + value.slice(end);
      setForm((current) => ({ ...current, content: next }));
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart + prefixed.length, lineStart + prefixed.length);
      });
      return;
    }

    const next = value.slice(0, start) + insert + value.slice(end);
    setForm((current) => ({ ...current, content: next }));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  const save = async (status) => {
    const found = validate(form);
    setErrors(found);
    setMessage(null);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      if (first === "content") setTab("write");
      requestAnimationFrame(() => document.getElementById(`post-${first}`)?.focus());
      setMessage({ type: "error", text: "Please fix the highlighted fields." });
      return;
    }

    setSaving(status);
    try {
      const payload = toPayload(form, status);
      if (isNew) {
        const { post: created } = await createPost(payload);
        setSaved(form);
        navigate(`/admin/posts/${created._id}`, { replace: true });
        setMessage({ type: "success", text: status === "published" ? "Post published." : "Draft saved." });
      } else {
        const { post: updated } = await updatePost(id, payload);
        const values = fromPost(updated);
        setPost(updated);
        setForm(values);
        setSaved(values);
        setMessage({
          type: "success",
          text:
            status === "published"
              ? post?.status === "published"
                ? "Changes published."
                : "Post published."
              : post?.status === "published"
                ? "Post unpublished and saved as a draft."
                : "Draft saved.",
        });
      }
    } catch (error) {
      if (error.status === 401) return expire();
      setErrors(error.fields || {});
      setMessage({ type: "error", text: error.message });
    } finally {
      setSaving("");
    }
  };

  if (loadState === "loading") return <PageLoader label="Loading post" />;
  if (loadState === "error") {
    return (
      <div role="alert" className="py-20 text-center">
        <p className="font-serif text-2xl text-ink-900">{loadError}</p>
        <Link to="/admin/posts" className="btn-ghost mt-6">
          Back to posts
        </Link>
      </div>
    );
  }

  const isPublished = post?.status === "published";
  const errorProps = (key) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `post-${key}-error` : undefined,
  });
  const snippetTitle = form.metaTitle || (form.title ? `${form.title} | GreatVoyagers` : "Your SEO title");
  const snippetDescription = form.metaDescription || form.excerpt || "Your meta description will appear here in search results.";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        save("published");
      }}
      noValidate
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <Link to="/admin/posts" className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All posts
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl text-ink-900 md:text-4xl">{isNew ? "New post" : "Edit post"}</h1>
            {post && <StatusBadge status={post.status} />}
            {dirty && <span className="text-xs font-semibold text-sand-500">Unsaved changes</span>}
          </div>
        </div>
        {isPublished && (
          <a
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-ink-900"
          >
            View on site <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        )}
      </div>

      {message && (
        <p
          role={message.type === "error" ? "alert" : "status"}
          className={`mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            message.type === "error" ? "bg-terra-500/10 text-terra-600" : "bg-sea-100 text-sea-500"
          }`}
        >
          {message.type === "error" ? <AlertCircle className="h-4 w-4" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
          {message.text}
        </p>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-12">
        <div className="space-y-6 xl:col-span-8">
          <section className="space-y-6 rounded-[1.5rem] border border-ink-900/10 bg-ivory-50 p-6 md:p-8">
            <Field id="post-title" label="Title" error={errors.title} counter={<Counter value={form.title} ideal={70} max={140} />}>
              <input
                id="post-title"
                value={form.title}
                onChange={set("title")}
                placeholder="e.g. 10 Best Beaches in Phuket for Families"
                className="field font-serif text-xl"
                {...errorProps("title")}
              />
            </Field>

            <Field
              id="post-slug"
              label="URL slug"
              error={errors.slug}
              hint={`${SITE_URL.replace(/^https?:\/\//, "")}/blog/${form.slug || "your-post-url"}`}
            >
              <input
                id="post-slug"
                value={form.slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  set("slug")({ target: { value: toSlug(event.target.value) } });
                }}
                className="field font-mono text-sm"
                {...errorProps("slug")}
              />
            </Field>

            <Field
              id="post-excerpt"
              label="Excerpt"
              hint="A 1–2 sentence summary shown on blog cards and under the title."
              error={errors.excerpt}
              counter={<Counter value={form.excerpt} ideal={200} max={320} />}
            >
              <textarea id="post-excerpt" rows={3} value={form.excerpt} onChange={set("excerpt")} className="field resize-y" {...errorProps("excerpt")} />
            </Field>
          </section>

          <section className="overflow-hidden rounded-[1.5rem] border border-ink-900/10 bg-ivory-50">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-900/10 px-4 py-3">
              <div role="tablist" aria-label="Editor mode" className="flex gap-1 rounded-full bg-ivory-200 p-1">
                {["write", "preview"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={tab === mode}
                    onClick={() => setTab(mode)}
                    className={`rounded-full px-4 py-1.5 text-sm font-semibold capitalize ${
                      tab === mode ? "bg-ivory-50 text-ink-900 shadow-sm" : "text-ink-600 hover:text-ink-900"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              {tab === "write" && (
                <div className="flex flex-wrap gap-0.5" role="toolbar" aria-label="Formatting">
                  {toolbar.map((tool) => (
                    <button
                      key={tool.label}
                      type="button"
                      onClick={() => applyFormat(tool)}
                      title={tool.label}
                      aria-label={tool.label}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 hover:bg-ink-900/5 hover:text-ink-900"
                    >
                      <tool.icon className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {tab === "write" ? (
              <div className="p-4 md:p-6">
                <label htmlFor="post-content" className="sr-only">
                  Article content (Markdown)
                </label>
                <textarea
                  id="post-content"
                  ref={contentRef}
                  value={form.content}
                  onChange={set("content")}
                  rows={24}
                  placeholder={"Write your article here.\n\n## Use headings to structure it\n\nUse **bold**, lists and [links](/blog/another-post) to make it easy to read."}
                  className="field min-h-[28rem] resize-y font-mono text-sm leading-relaxed"
                  {...errorProps("content")}
                />
                {errors.content && (
                  <p id="post-content-error" className="mt-1.5 text-xs font-semibold text-terra-600">
                    {errors.content}
                  </p>
                )}
                <p className="mt-3 text-xs text-ink-400">
                  {words.toLocaleString("en-IN")} words · about {Math.max(1, Math.round(words / 220))} min read · Formatting uses{" "}
                  <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="font-semibold underline">
                    Markdown
                  </a>
                  . Aim for 900+ words for SEO.
                </p>
              </div>
            ) : (
              <div className="min-h-[28rem] p-6 md:p-10">
                {form.content.trim() ? (
                  <div className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: preview }} />
                ) : (
                  <p className="text-ink-400">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6 xl:col-span-4">
          <section className="rounded-[1.5rem] border border-ink-900/10 bg-ivory-50 p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-terra-500">Publish</h2>
            <div className="mt-5 space-y-5">
              <Field id="post-publishedAt" label="Publish date" hint="Leave empty to use the date you publish.">
                <input id="post-publishedAt" type="date" value={form.publishedAt} onChange={set("publishedAt")} className="field" />
              </Field>
              <Field id="post-author" label="Author">
                <input id="post-author" value={form.author} onChange={set("author")} className="field" />
              </Field>
              <div className="flex flex-col gap-2 pt-2">
                <button type="submit" disabled={Boolean(saving)} className="btn-primary w-full py-3.5 disabled:opacity-70">
                  {saving === "published" && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {isPublished ? "Update post" : "Publish"}
                </button>
                <button
                  type="button"
                  onClick={() => save("draft")}
                  disabled={Boolean(saving)}
                  className="btn-ghost w-full py-3 disabled:opacity-70"
                >
                  {saving === "draft" && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {isPublished ? "Unpublish (save as draft)" : "Save draft"}
                </button>
              </div>
            </div>
          </section>

          <section className="space-y-5 rounded-[1.5rem] border border-ink-900/10 bg-ivory-50 p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-terra-500">Cover image</h2>
            <div className="aspect-[16/9] overflow-hidden rounded-xl bg-ivory-200">
              {form.coverImage && !coverBroken ? (
                <img src={coverSrc(form.coverImage, 800, 450)} alt="" onError={() => setCoverBroken(true)} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-ink-400">
                  <ImageOff className="h-5 w-5" aria-hidden="true" />
                  {coverBroken ? "Image couldn't be loaded" : "Paste an image URL below"}
                </div>
              )}
            </div>
            <Field id="post-coverImage" label="Image URL" error={errors.coverImage} hint="Free photos: unsplash.com (right-click a photo › Copy image address).">
              <input
                id="post-coverImage"
                type="url"
                value={form.coverImage}
                onChange={set("coverImage")}
                placeholder="https://images.unsplash.com/…"
                className="field text-sm"
                {...errorProps("coverImage")}
              />
            </Field>
            <Field id="post-coverAlt" label="Alt text" hint="Describe the image for screen readers and Google Images.">
              <input id="post-coverAlt" value={form.coverAlt} onChange={set("coverAlt")} className="field text-sm" />
            </Field>
          </section>

          <section className="space-y-5 rounded-[1.5rem] border border-ink-900/10 bg-ivory-50 p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-terra-500">Organise</h2>
            <Field id="post-category" label="Category" error={errors.category}>
              <input
                id="post-category"
                list="post-categories"
                value={form.category}
                onChange={set("category")}
                className="field"
                {...errorProps("category")}
              />
              <datalist id="post-categories">
                {categories.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </Field>
            <Field id="post-tags" label="Tags" hint="Separate with commas, e.g. thailand, phuket, beaches">
              <input id="post-tags" value={form.tags} onChange={set("tags")} className="field" />
            </Field>
          </section>

          <section className="space-y-5 rounded-[1.5rem] border border-ink-900/10 bg-ivory-50 p-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-terra-500">SEO</h2>
            <div className="rounded-xl border border-ink-900/10 bg-white p-4" aria-label="Google search preview">
              <p className="truncate text-xs text-[#4d5156]">{`${SITE_URL.replace(/^https?:\/\//, "")} › blog › ${form.slug || "…"}`}</p>
              <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{snippetTitle}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">{snippetDescription}</p>
            </div>
            <Field
              id="post-metaTitle"
              label="SEO title"
              hint="Defaults to the post title. Include your main keyword."
              error={errors.metaTitle}
              counter={<Counter value={form.metaTitle} ideal={60} max={70} />}
            >
              <input id="post-metaTitle" value={form.metaTitle} onChange={set("metaTitle")} className="field text-sm" {...errorProps("metaTitle")} />
            </Field>
            <Field
              id="post-metaDescription"
              label="Meta description"
              hint="Defaults to the excerpt. Aim for 140–160 characters."
              error={errors.metaDescription}
              counter={<Counter value={form.metaDescription} ideal={160} max={170} />}
            >
              <textarea
                id="post-metaDescription"
                rows={3}
                value={form.metaDescription}
                onChange={set("metaDescription")}
                className="field resize-y text-sm"
                {...errorProps("metaDescription")}
              />
            </Field>
          </section>
        </aside>
      </div>
    </form>
  );
}
