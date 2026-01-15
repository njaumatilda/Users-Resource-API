import { Router } from "express"
import { register, login } from "../controllers/usersAuth.js"
import { registerSchema, loginSchema } from "../utils/joiValidation.js"
import joiValidator from "../middlewares/joiValidation.js"

const router = Router()

router.post("/register", joiValidator(registerSchema), register)

router.post("/login", joiValidator(loginSchema), login)

export default router
