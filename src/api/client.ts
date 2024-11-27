import { ApiError, ApiServerError, SessionTokenError } from "./errors.ts";
import { getDelayMs, parseResponse } from "./parser.ts";
import { type SubmitResponse, SubmitResult } from "./types.ts";

interface ApiClientArgs {
  baseUrl?: string | URL;
  sessionToken: string;
  year: number;
}

export class ApiClient {
  #baseUrl: string | URL;
  #sessionToken: string;
  #year: number;

  constructor({ baseUrl, sessionToken, year }: ApiClientArgs) {
    this.#baseUrl = baseUrl ?? "https://adventofcode.com";
    this.#sessionToken = sessionToken;
    this.#year = year;
  }

  #headers() {
    return {
      cookie: `session=${this.#sessionToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "https://github.com/njgingrich/aocrunner by njgingrich@gmail.com",
    };
  }

  #request(
    method: RequestInit["method"],
    route: string,
    requestInit?: Omit<RequestInit, "method">,
  ) {
    if (!this.#sessionToken || this.#sessionToken.length === 0) {
      throw new SessionTokenError();
    }

    const url = new URL(route, this.#baseUrl);
    return fetch(url, {
      method,
      headers: this.#headers(),
      ...requestInit,
    });
  }

  getResponse(html: string): SubmitResponse {
    const content = parseResponse(html);
    const el = content.window.document.querySelector("main")?.textContent ?? "";

    if (el.includes("That's the right answer")) {
      return { type: SubmitResult.SUCCESS };
    }

    if (el.includes("That's not the right answer")) {
      return { type: SubmitResult.FAILURE };
    }

    if (el.includes("You gave an answer too recently")) {
      return { type: SubmitResult.RATE_LIMIT, delayMs: getDelayMs(content) };
    }

    return { type: SubmitResult.UNKNOWN };
  }

  #handleErrors(err: unknown): SubmitResponse {
    if (err instanceof SessionTokenError) {
      return { type: SubmitResult.TOKEN_ERROR };
    }

    if (err instanceof ApiError) {
      return { type: SubmitResult.ERROR };
    }

    return { type: SubmitResult.UNKNOWN };
  }

  async getInput(day: number) {
    const response = await this.#request("GET", `/${this.#year}/day/${day}/input`);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${response.url}: ${response.statusText}`);
    }

    return response.text();
  }

  async submit(day: number, part: 1 | 2, solution: any): Promise<SubmitResponse> {
    const body = new URLSearchParams({ level: part.toString(), answer: solution }).toString();

    try {
      const response = await this.#request("POST", `/${this.#year}/day/${day}/answer`, { body });
      if (response.status !== 200) {
        if (response.status === 400 || response.status === 500) {
          throw new SessionTokenError();
        } else if (response.status.toString().startsWith("5")) {
          throw new ApiServerError();
        }
      }

      if (!response.ok) {
        throw new ApiError(`Failed to submit solution for day ${day}, part ${part}`);
      }

      const text = await response.text();
      return this.getResponse(text);
    } catch (err) {
      return this.#handleErrors(err);
    }
  }
}
