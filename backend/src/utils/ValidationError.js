// Domain validation error (framework-agnostic). Carries the collected error
// messages. NOT Express-specific — domain models throw this when a caller
// (HTTP route, migration, future code) attempts to persist invalid data; the
// HTTP error handler translates it into a 400 response.
export class ValidationError extends Error {
  constructor(errors) {
    super(errors.join(' '))
    this.name = 'ValidationError'
    this.errors = errors
  }
}
