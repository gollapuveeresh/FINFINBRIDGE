// Access control middleware based on user roles
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user must be populated by authMiddleware (protect) first
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized, no role found in request context',
      });
    }

    // Check if user role is in the allowedRoles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Forbidden: User role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    next();
  };
};
