export function toolBasicResponse(text: string) {
  return { content: [{ type: "text" as const, text }] };
}
