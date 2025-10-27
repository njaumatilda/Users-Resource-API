const roleBasedAccessValidator = (allowedRoles) => {
  if (!Array.isArray(allowedRoles)) {
    throw new Error("allowedRoles must be an array")
  }

  return (req, res, next) => {
    const { role } = req.user

    if (!allowedRoles.includes(role)) {
        return res.status(403).json({
            message: "You don't have permissions to make that request"
        })
    }

    next()
  }
}

export default roleBasedAccessValidator