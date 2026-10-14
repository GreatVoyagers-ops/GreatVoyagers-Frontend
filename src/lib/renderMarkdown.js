import DOMPurify from "dompurify";
import { markdownToHtml } from "./markdown";

export default function renderMarkdown(markdown) {
  return DOMPurify.sanitize(markdownToHtml(markdown || ""));
}
