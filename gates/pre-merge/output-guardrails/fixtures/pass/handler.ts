export function handleAi(llmOutput: string, validateAiOutput: (s: string) => unknown) {
  return validateAiOutput(llmOutput);
}
