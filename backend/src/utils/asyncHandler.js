/**
 * Wraps asynchronous Express route handlers to catch errors and forward to centralized error middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

