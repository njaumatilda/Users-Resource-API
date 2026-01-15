const joiValidator = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(req.body, {
      abortEarly: false,
    })
    if (error) {
      // instead of stopping validation(abortEarly === true) at first error,
      // return all validation error messages
      const errorMessages = error.details.map((detail) => detail.message)

      return res.status(400).json({
        errors: errorMessages,
      })
    }

    req.body = value //overwrite req.body with the sanitized Joi value

    next()
  }
}

export default joiValidator
