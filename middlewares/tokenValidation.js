import jwt from "jsonwebtoken"

const JWT_KEY = process.env.JWT_KEY

const tokenValidator = (req, res, next) => {
  try {
    const { authorization } = req.headers

    let token = authorization

    if (!token) {
      return res.status(401).json({
        message: "Validation token is missing",
      })
    }

    if (!token.includes("Bearer")) {
      res.status(422).json({
        message: "Invalid authentication type",
      })
    }

    token = token.split(" ")[1]

    const decodedToken = jwt.verify(token, JWT_KEY)
    req.user = decodedToken
    next()
  } catch (error) {
    console.log(error)

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token",
      })
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in",
      })
    }

    res.status(500).json({
      message: "Internal Server Error",
    })
  }
}

export default tokenValidator