import "dotenv/config"
import express from "express"

import { dbConnect } from "./db.js"
import tokenValidator from "./middlewares/tokenValidation.js"

import usersRoutes from "./routes/user.js"
import usersAuthRoutes from "./routes/usersAuth.js"

const app = express()
const PORT = process.env.PORT

app.use(express.json())

app.use("/users", tokenValidator, usersRoutes)
app.use("/auth/users", usersAuthRoutes)

app.listen(PORT, () => {
  console.log(`[server]: App listening on port: ${PORT}`)
  dbConnect()
})
