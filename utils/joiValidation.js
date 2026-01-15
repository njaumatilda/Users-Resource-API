import Joi from "joi"

const validateName = Joi.string()
  .min(3)
  .max(20)
  .trim()
  .required()
  .uppercase()
  .messages({
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must not exceed 20 characters",
    "any.required": "Please provide a name",
    "string.empty": "Name field is not allowed to be empty",
  })

const validateEmail = Joi.string()
  .email()
  .trim()
  .required()
  .lowercase()
  .messages({
    "string.email": "Invalid email address",
    "any.required": "Please provide an email address",
    "string.empty": "Email field is not allowed to be empty",
  })

const validatePassword = Joi.string().required().messages({
  "string.min": "Password must be at least 8 characters long",
  "string.pattern.base":
    "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
  "any.required": "Please provide a password",
  "string.empty": "Password field is not allowed to be empty",
})

const validateRole = Joi.string()
  .trim()
  .required()
  .valid("owner", "admin", "user")
  .messages({
    "any.only": "Role not allowed",
    "any.required": "Please provide a role",
    "string.empty": "Role field is not allowed to be empty",
  })

const registerSchema = Joi.object({
  name: validateName,
  email: validateEmail,
  password: validatePassword
    .min(8)
    .pattern(new RegExp("[a-z]")) // at least one lowercase
    .pattern(new RegExp("[A-Z]")) // at least one uppercase
    .pattern(new RegExp("[0-9]")) // at least one number
    .pattern(new RegExp('[!@#$%^&*(),.?":{}|<>]')), // at least one special character,
  role: validateRole,
})

const loginSchema = Joi.object({
  email: validateEmail,
  password: validatePassword,
})

export { registerSchema, loginSchema }
