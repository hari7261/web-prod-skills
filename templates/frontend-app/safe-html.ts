import DOMPurify from "dompurify";

const ALLOWED_TAGS = ["p", "br", "strong", "em", "ul", "ol", "li", "code", "pre", "a"];
const ALLOWED_ATTR = ["href", "rel", "target"];

export function sanitizeUntrustedHtml(rawHtml: string): string {
  return DOMPurify.sanitize(String(rawHtml ?? ""), {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false
  });
}

