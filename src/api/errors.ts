export class ApiError extends Error {
  constructor(message?: any) {
    super(message ?? "ApiError");
    this.name = "ApiError";
  }
}

export class ApiServerError extends ApiError {
  constructor(message?: any) {
    super(message ?? "ApiServerError");
    this.name = "ApiServerError";
  }
}

export class SessionTokenError extends ApiError {
  constructor(message?: any) {
    super(message ?? "SessionTokenError");
    this.name = "SessionTokenError";
  }
}
