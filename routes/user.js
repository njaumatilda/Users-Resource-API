import { Router } from "express"
import {
  readSingeleUser,
  readAllUsers,
  createUser,
  updateUser,
  deleteSingleUser,
  deleteAllUsers,
} from "../controllers/user.js"

import roleBasedAccessValidator from "../middlewares/roleBasedAccessValidation.js"

const router = Router()

router.get("/:id", readSingeleUser)

router.get("/", readAllUsers)

router.post("/", roleBasedAccessValidator(["admin"]), createUser)

router.patch("/:id", updateUser)

router.delete(
  "/:id",
  roleBasedAccessValidator(["admin", "owner"]),
  deleteSingleUser
)

router.delete("/", roleBasedAccessValidator(["admin", "owner"]), deleteAllUsers)

export default router
