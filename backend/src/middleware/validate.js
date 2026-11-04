/**
 * Validation Middleware Wrapper
 * Executes validator function and attaches sanitized output to req.validated
 * @param {Function} validatorFn
 */
export const validate = (validatorFn) => {
  return (req, _res, next) => {
    try {
      const sanitized = validatorFn(req.body);
      req.validated = sanitized;
      next();
    } catch (error) {
      next(error);
    }
  };
};

