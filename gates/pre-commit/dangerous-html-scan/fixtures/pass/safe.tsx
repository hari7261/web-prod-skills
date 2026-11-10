import DOMPurify from "dompurify";
export function renderBio(bio: string) {
  return { __html: DOMPurify.sanitize(bio) };
}

