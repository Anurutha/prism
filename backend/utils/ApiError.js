// A typed error so the global error handler can map it to the correct
// HTTP status code and a safe, user-facing message.
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isApiError = true;
  }
}
