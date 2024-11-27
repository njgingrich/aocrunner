export const enum SubmitResult {
  /** Submission was correct */
  SUCCESS = "SUCCESS",
  /** Submission was incorrect */
  FAILURE = "FAILURE",
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
  type: SubmitResult.SUCCESS;
};
type FailureResponse = {
  type: SubmitResult.FAILURE;
};
type RateLimitResponse = {
  type: SubmitResult.RATE_LIMIT;
  delayMs: number;
};
type SessionTokenErrorResponse = {
  type: SubmitResult.TOKEN_ERROR;
};
type ErrorResponse = {
  type: SubmitResult.ERROR;
};
type UnknownResponse = {
  type: SubmitResult.UNKNOWN;
};

export type SubmitResponse =
  | SuccessResponse
  | FailureResponse
  | RateLimitResponse
  | SessionTokenErrorResponse
  | ErrorResponse
  | UnknownResponse;
