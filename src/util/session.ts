import "@std/dotenv/load";

export function getSessionToken(): string {
  return Deno.env.get("AOC_SESSION_TOKEN") ?? "";
}
