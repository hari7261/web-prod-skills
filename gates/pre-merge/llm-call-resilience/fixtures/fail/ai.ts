export async function askModel(openai: any, input: string) {
  return openai.responses.create({ model: "gpt-4o-mini", input });
}
