import * as log from "@std/log";

import type { Config } from "../config.ts";
import type { Solution } from "../types.ts";
import { ApiError, ApiServerError, NotFoundError, SessionTokenError } from "./errors.ts";
import { getDelayMs, parseResponse } from "./parser.ts";
import { ApiResult, type InputResponse, type SubmitResponse } from "./types.ts";

interface ApiClientArgs {
  baseUrl?: string | URL;
  config: Config;
  sessionToken: string;
}

const DEFAULT_DELAY_MS = 60_000;

export class ApiClient {
  #baseUrl: string | URL;
  #config: Config;
  #sessionToken: string;
  #year: number;

  /** How long we have to wait before submitting */
  #submitDelayMs = 0;
  /** The unix timestamp of the most recent submission */
  #prevSubmitTimestamp = 0;

  constructor({ baseUrl, config, sessionToken }: ApiClientArgs) {
    this.#baseUrl = baseUrl ?? "https://adventofcode.com";
    this.#config = config;
    this.#sessionToken = sessionToken;

    this.#year = Number(config.get().year);

    const configSubmitDelay = config.get().submitDelayMs;
    if (configSubmitDelay !== undefined) {
      this.#submitDelayMs = configSubmitDelay;
    }

    const configPrevSubmitTimestamp = config.get().prevSubmitTimestamp;
    if (configPrevSubmitTimestamp !== undefined) {
      this.#prevSubmitTimestamp = configPrevSubmitTimestamp;
    }
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
    const el = parseResponse(html);
    log.debug("Parsed response", el);

    if (el.includes("That's the right answer")) {
      return { type: ApiResult.SUCCESS };
    }

    if (el.includes("That's not the right answer")) {
      return { type: ApiResult.FAILURE };
    }

    if (el.includes("You gave an answer too recently")) {
      return { type: ApiResult.RATE_LIMIT, delayMs: getDelayMs(html) };
    }

    if (el.includes("Did you already complete it")) {
      return { type: ApiResult.ERROR, error: new ApiError("Already completed") };
    }

    return { type: ApiResult.UNKNOWN, error: new ApiError("Unable to parse server response") };
  }

  #handleSubmitErrors(error: unknown): SubmitResponse {
    log.debug("Submission request failed", { error });
    if (error instanceof SessionTokenError) {
      return { type: ApiResult.TOKEN_ERROR, error };
    }

    if (error instanceof ApiError) {
      return { type: ApiResult.ERROR, error };
    }

    if (error instanceof Error) {
      return { type: ApiResult.UNKNOWN, error };
    }

    return { type: ApiResult.UNKNOWN, error: error as Error };
  }

  #handleGetErrors(error: unknown): InputResponse {
    log.debug("Get request failed", { error });
    if (error instanceof SessionTokenError) {
      return { type: ApiResult.TOKEN_ERROR, error };
    }

    if (error instanceof NotFoundError) {
      return { type: ApiResult.NOT_FOUND, error };
    }

    if (error instanceof ApiError) {
      return { type: ApiResult.ERROR, error };
    }

    if (error instanceof Error) {
      return { type: ApiResult.UNKNOWN, error };
    }

    return { type: ApiResult.UNKNOWN, error: error as Error };
  }

  #canSubmit() {
    if (this.#prevSubmitTimestamp <= 0) {
      return true;
    }

    const newSubmitDelayMs = this.#checkDelay();
    if (newSubmitDelayMs <= 0) {
      return true;
    }

    return false;
  }

  #checkDelay() {
    const now = Date.now();
    const remainingDelayMs = this.#submitDelayMs - (now - this.#prevSubmitTimestamp);

    if (remainingDelayMs > 0) {
      this.#setDelay(remainingDelayMs);
    }
    return remainingDelayMs;
  }

  #setDelay(newDelayMs: number) {
    this.#prevSubmitTimestamp = Date.now();
    this.#submitDelayMs = newDelayMs;

    this.#config.write({
      prevSubmitTimestamp: this.#prevSubmitTimestamp,
      submitDelayMs: this.#submitDelayMs,
    });
  }

  async getInput(day: number): Promise<InputResponse> {
    try {
      const response = await this.#request("GET", `/${this.#year}/day/${day}/input`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${response.url}: ${response.statusText}`);
      }

      return {
        type: ApiResult.SUCCESS,
        input: await response.text(),
      };
    } catch (err) {
      return this.#handleGetErrors(err);
    }
  }

  async submit(
    day: number,
    part: 1 | 2,
    solution: Solution,
  ): Promise<SubmitResponse> {
    const body = new URLSearchParams({ level: part.toString(), answer: `${solution}` }).toString();
    log.debug("Submitting solution", { day, part, solution, this: this });

    if (!this.#canSubmit()) {
      // We can't submit yet, let the user know
      return { type: ApiResult.RATE_LIMIT, delayMs: this.#submitDelayMs };
    }

    try {
      const response = await this.#request("POST", `/${this.#year}/day/${day}/answer`, { body });
      log.debug("Received response", { status: response.status, response });
      if (response.status !== 200) {
        if (response.status === 400 || response.status === 500) {
          throw new SessionTokenError();
        } else if (response.status === 404) {
          throw new NotFoundError();
        } else if (response.status.toString().startsWith("5")) {
          throw new ApiServerError();
        }
      }

      if (!response.ok) {
        throw new ApiError(`Failed to submit solution for day ${day}, part ${part}`);
      }

      const text = await response.text();
      const submitResponse = this.getResponse(text);
      if (submitResponse.type === ApiResult.RATE_LIMIT) {
        this.#setDelay(submitResponse.delayMs);
      } else {
        this.#setDelay(DEFAULT_DELAY_MS);
      }

      return submitResponse;
    } catch (err) {
      return this.#handleSubmitErrors(err);
    }
  }
}

let _client: ApiClient;

export function getClient(params: ApiClientArgs) {
  if (_client) {
    return _client;
  }

  _client = new ApiClient(params);
  return _client;
}
