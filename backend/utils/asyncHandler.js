/**
 * Simple higher-order function to wrap asynchronous Express route handlers
 * and pass any uncaught exceptions to the global error middleware.
 *
 * @param {Function} fn - Asynchronous route handler function
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
