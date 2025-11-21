import mongoose from "mongoose"
import Joi from "joi"
import bcrypt from "bcrypt"
import userModel from "../models/User.js"
import isValidEmailDomain from "../utils/validEmailDomainChecker.js"
import redisClient from "../redis.js"

const SALT = Number(process.env.SALT)

const readAllUsers = async (req, res) => {
  try {
    const cacheKey = `users:list:${req.originalUrl}`

    // Check the cache first---stores data as strings
    const cachedData = await redisClient.get(cacheKey)
    if (cachedData && cachedData !== null) {
      console.log("CACHE HIT")
      return res.status(200).json(JSON.parse(cachedData)) // convert the string data from the cache to an object before returning it
    }

    // If cache has no data
    console.log("CACHE MISS: Query the database")
    const users = await userModel.find()

    // set the data in the cache first before returning it
    if (users && users.length > 0) {
      await redisClient.setex(cacheKey, 1800, JSON.stringify(users)) // convert the object data from the DB to a string before returning storing it inside the cache
    }

    res.status(200).json(users)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const readSingeleUser = async (req, res) => {
  try {
    const { id } = req.params

    const checkForValidId = mongoose.Types.ObjectId.isValid(id)
    if (!checkForValidId) {
      return res.status(400).json({
        message: "Invalid ID format",
      })
    }

    const cacheKey = `user:detail:${id}`

    const cachedData = await redisClient.get(cacheKey)
    if (cachedData && cachedData !== null) {
      console.log("CACHE HIT")
      return res.status(200).json(JSON.parse(cachedData))
    }

    console.log("CACHE MISS: Query the database")
    const findUser = await userModel.findById({ _id: id })
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    await redisClient.setex(cacheKey, 900, JSON.stringify(findUser))
    res.status(200).json(findUser)
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const schema = Joi.object({
      name: Joi.string().min(3).max(20).trim().required().uppercase().messages({
        "string.min": "Name must be at least 3 characters long",
        "string.max": "Name must not exceed 20 characters",
        "any.required": "Please provide a name",
        "string.empty": "Name field is not allowed to be empty",
      }),
      email: Joi.string().email().trim().required().lowercase().messages({
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

    // TODO: to check further if email exists, send a verification email:
    // where the user will verify then a successful creation happens
    // also send an email to the user with their details when an admin creates their account

    const newUser = await userModel.create({
      name: value.name,
      email: value.email,
      password: bcrypt.hashSync(value.password, SALT),
      role: value.role,
    })

    res.status(201).json({
      message: `User created successfully by ${req.user.role}`,
      user: newUser,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { id: userId } = req.user //renaming to avoid redeclaration error
    const { name, email, age } = req.body
    const updatedData = {}

    const checkForValidId = mongoose.Types.ObjectId.isValid(id)
    if (!checkForValidId) {
      return res.status(400).json({
        message: "Invalid ID format",
      })
    }

    if (userId !== id) {
      return res.status(401).json({
        message: "You are not authorized to update that user",
      })
    }

    if (name) {
      const nameSchema = Joi.string()
        .min(3)
        .max(20)
        .trim()
        .uppercase()
        .messages({
          "string.min": "Name must be at least 3 characters long",
          "string.max": "Name must not exceed 20 characters",
          "string.empty": "Name field is not allowed to be empty",
        })
      const { value, error } = nameSchema.validate(name)
      if (error) {
        return res.status(400).json({ message: error.details[0].message })
      }

      if (name != null) updatedData.name = value
    }

    if (email) {
      const emailSchema = Joi.string().email().trim().lowercase().messages({
        "string.email": "Invalid email address",
        "string.empty": "Email field is not allowed to be empty",
      })
      const { value, error } = emailSchema.validate(email)
      if (error) {
        return res.status(400).json({ message: error.details[0].message })
      }

      if (email != null) updatedData.email = value
    }

    if (age) {
      const ageSchema = Joi.number().positive().min(18).max(90).messages({
        "number.positive": "Only positive numbers are allowed",
        "number.min": "Users age cannot be less than 18years",
        "number.max": "Users age cannot exceed 90years",
        "number.base": "Please provide a valid age",
      })
      const { value, error } = ageSchema.validate(age, { convert: false }) //strings won't be type cast
      if (error) {
        return res.status(400).json({ message: error.details[0].message })
      }

      if (age != null) updatedData.age = value
    }

    const findUserToUpdate = await userModel.findById({ _id: id })
    if (!findUserToUpdate) {
      return res.status.json({
        message: "User not found",
      })
    }

    if (updatedData.email) {
      const checkForValidEmail = await isValidEmailDomain(updatedData.email)
      if (!checkForValidEmail) {
        return res.status(400).json({
          message: "Invaid email domain",
        })
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      { _id: id },
      updatedData,
      { new: true }
    )

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const deleteSingleUser = async (req, res) => {
  try {
    const { id } = req.params

    const checkForValidId = mongoose.Types.ObjectId.isValid(id)
    if (!checkForValidId) {
      return res.status(400).json({
        message: "Invalid ID format",
      })
    }

    const findUser = await userModel.findById({ _id: id })
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    const deletedUser = await userModel.findByIdAndDelete({ _id: id })

    res.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

const deleteAllUsers = async (req, res) => {
  try {
    const deletedUsers = await userModel.deleteMany({})

    res.status(200).json({
      message: "Users deleted successfully",
      users: deletedUsers,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

export {
  readSingeleUser,
  readAllUsers,
  createUser,
  updateUser,
  deleteSingleUser,
  deleteAllUsers,
}
