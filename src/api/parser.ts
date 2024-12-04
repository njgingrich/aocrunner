// @ts-types="npm:@types/jsdom@21.1.7"
import jsdom from "npm:jsdom@25.0.1";

/**
 * Parse the HTML response from the server.
 *
 * @param html The raw text response
 * @returns The parsed DOM
 */
export function parseResponse(html: string): string {
  const content = new jsdom.JSDOM(html);
  return content.window.document.querySelector("main")?.textContent ?? "";
}

/**
 * Get the time (in milliseconds) the page says we must wait before re-submitting the solution.
 *
 * @param dom The raw text response
 * @returns The required delay in milliseconds. Defaults to 1 minute.
 */
export function getDelayMs(html: string) {
  const content = new jsdom.JSDOM(html);
  const main = content.window.document.querySelector("main");
  if (!main) {
    return 60_000;
  }
  // TODO: check this for real!

  return 60_000;
}
