import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import userModel from "../models/User.js"
import isValidEmailDomain from "../utils/validEmailDomainChecker.js"

const SALT = Number(process.env.SALT)
const JWT_KEY = process.env.JWT_KEY

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    const checkForExistingEmail = await userModel.findOne({
      email: email,
    })
    if (checkForExistingEmail) {
      return res.status(409).json({
        message: "Email is already in use",
      })
    }

    const checkForValidEmail = await isValidEmailDomain(email)
    if (!checkForValidEmail) {
      return res.status(400).json({
        message: "Invalid email domain",
      })
    }

    // TODO: VERIFY EMAIL BEFORE CREATING THE USER
    // TODO: SEND USER EMAIL AFTER ACCOUNT CREATION FOR THE SUCCESSFUL PROCESS

    const newUser = await userModel.create({
      name,
      email,
      password: await bcrypt.hash(password, SALT),
      role,
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

    const findUser = await userModel.findOne({ email: email })
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      })
    }

    const checkForPasswordMatch = await bcrypt.compare(
      password,
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
