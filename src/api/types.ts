import type { ApiError, SessionTokenError } from "./errors.ts";

export const enum ApiResult {
  /** Submission was correct */
  SUCCESS = "SUCCESS",
  /** Submission was incorrect */
  FAILURE = "FAILURE",
  /** Submission was not checked - could not find resource */
  NOT_FOUND = "NOT_FOUND",
  /** Submission was not checked - rate limited */
  RATE_LIMIT = "RATE_LIMIT",
  /** Submission was not checked - invalid token */
  TOKEN_ERROR = "TOKEN_ERROR",
  /** Submission was not checked - general error response from server */
  ERROR = "ERROR",
  /** Submission was not checked - unknown general response */
  UNKNOWN = "UNKNOWN",
}

type SuccessResponse = {
  type: ApiResult.SUCCESS;
};
type FailureResponse = {
  type: ApiResult.FAILURE;
};
type RateLimitResponse = {
  type: ApiResult.RATE_LIMIT;
  delayMs: number;
};
type SessionTokenErrorResponse = {
  type: ApiResult.TOKEN_ERROR;
  error: SessionTokenError;
};
type NotFoundResponse = {
  type: ApiResult.NOT_FOUND;
  error: ApiError;
}
type ErrorResponse = {
  type: ApiResult.ERROR;
  error: ApiError;
};
type UnknownResponse = {
  type: ApiResult.UNKNOWN;
  error?: Error;
};

export type SubmitResponse =
  | SuccessResponse
  | FailureResponse
  | RateLimitResponse
  | SessionTokenErrorResponse
  | NotFoundResponse
  | ErrorResponse
  | UnknownResponse;

type InputSuccessResponse = {
  type: ApiResult.SUCCESS;
  input: string;
};

export type InputResponse =
  | InputSuccessResponse
  | SessionTokenErrorResponse
  | NotFoundResponse
  | ErrorResponse
  | UnknownResponse;
