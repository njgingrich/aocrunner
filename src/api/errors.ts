export class ApiError extends Error {
  constructor(message?: string) {
    super(message ?? "ApiError");
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message?: string) {
    super(message ?? "NotFoundError");
    this.name = "NotFoundError";
  }
}

export class ApiServerError extends ApiError {
  constructor(message?: string) {
    super(message ?? "ApiServerError");
    this.name = "ApiServerError";
  }
}

export class SessionTokenError extends ApiError {
  constructor(message?: string) {
    super(message ?? "SessionTokenError");
    this.name = "SessionTokenError";
  }
}
