// @ts-types="npm:@types/jsdom@21.1.7"
import jsdom from "npm:jsdom@25.0.1";

/**
 * Parse the HTML response from the server.
 *
 * @param html The raw text response
 * @returns The parsed DOM
 */
export function parseResponse(html: string): jsdom.JSDOM {
  return new jsdom.JSDOM(html);
}

/**
 * Get the time (in milliseconds) the page says we must wait before re-submitting the solution.
 *
 * @param dom The returned page DOM
 * @returns The required delay in milliseconds. Defaults to 1 minute.
 */
export function getDelayMs(dom: jsdom.JSDOM) {
  return 60_000;
}
