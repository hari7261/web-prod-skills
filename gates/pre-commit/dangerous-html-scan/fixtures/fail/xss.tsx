export function renderLlmReply(reply: string) {
  return <div dangerouslySetInnerHTML={{ __html: reply }} />;
}
