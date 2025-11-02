module Wusul
  # Base error class for Wusul SDK
  class WusulError < StandardError; end

  # Error raised when a request is invalid (400)
  class BadRequestError < WusulError; end

  # Error raised when authentication fails (401)
  class UnauthorizedError < WusulError; end

  # Error raised when access is forbidden (403)
  class ForbiddenError < WusulError; end

  # Error raised when a resource is not found (404)
  class NotFoundError < WusulError; end

  # Error raised when rate limit is exceeded (429)
  class RateLimitError < WusulError; end

  # Error raised when server encounters an error (500+)
  class ServerError < WusulError; end
end
