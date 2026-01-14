import Joi from "joi"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from "../models/User.js"
import isValidEmailDomain from "../utils/validEmailDomainChecker.js"

const SALT = Number(process.env.SALT)
const JWT_KEY = process.env.JWT_KEY

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // when there's no min check in string joi validation, always treat 
    // empty strings ie. ("") as null and not truthy
    const schema = Joi.object({
      name: Joi.string().min(3).max(20).trim().required().uppercase().messages({
        "string.min": "Name must be at least 3 characters long",
        "string.max": "Name must not exceed 20 characters",
        "any.required": "Please provide a name",
        "string.empty": "Name field is not allowed to be empty",
      }),
      email: Joi.string()
        .email()
        .trim()
        .required()
        .empty("")
        .lowercase()
        .messages({
          "string.email": "Invalid email address",
          "any.required": "Please provide an email address",
          "string.empty": "Email field is not allowed to be empty",
        }),
      password: Joi.string()
        .min(8)
        .required()
        .pattern(new RegExp("[a-z]")) // at least one lowercase
        .pattern(new RegExp("[A-Z]")) // at least one uppercase
        .pattern(new RegExp("[0-9]")) // at least one number
        .pattern(new RegExp('[!@#$%^&*(),.?":{}|<>]')) // at least one special character
        .messages({
          "string.min": "Password must be at least 8 characters long",
          "string.pattern.base":
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character",
          "any.required": "Please provide a password",
          "string.empty": "Password field is not allowed to be empty",
        }),
      role: Joi.string()
        .trim()
        .required()
        .empty("")
        .valid("owner", "admin", "user")
        .messages({
          "any.only": "Role not allowed",
          "any.required": "Please provide a role",
          "string.empty": "Role field is not allowed to be empty",
        }),
    })

    const { value, error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      })
    }

    const checkForExistingEmail = await userModel.findOne({
      email: value.email,
    })
    if (checkForExistingEmail) {
      return res.status(409).json({
        message: "Email is already in use",
      })
    }

    const checkForValidEmail = await isValidEmailDomain(value.email)
    if (!checkForValidEmail) {
      return res.status(400).json({
        message: "Invalid email domain",
      })
    }

    // TODO: VERIFY EMAIL BEFORE CREATING THE USER
    // TODO: SEND USER EMAIL AFTER ACCOUNT CREATION FOR THE SUCCESSFUL PROCESS

    const newUser = await userModel.create({
      name: value.name,
      email: value.email,
      password: bcrypt.hashSync(value.password, SALT),
      role: value.role,
    })

    res.status(201).json({
      message: "User created successfully",
      user: newUser,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const schema = Joi.object({
      email: Joi.string().email().trim().required().lowercase().messages({
        "string.email": "Invalid email address",
        "any.required": "Please provide an email address",
        "string.empty": "Email field is not allowed to be empty",
      }),
      password: Joi.string().required().messages({
        "any.required": "Please provide a password",
        "string.empty": "Password field is not allowed to be empty",
      }),
    })

    const { value, error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      })
    }

    const findUser = await userModel.findOne({ email: value.email })
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    const checkForPasswordMatch = await bcrypt.compare(
      value.password,
      findUser.password
    )

    if (!checkForPasswordMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    const token = jwt.sign(
      {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        role: findUser.role,
      },
      JWT_KEY,
      { expiresIn: "2d" }
    )

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        role: findUser.role,
      },
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

export { register, login }
