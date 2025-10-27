import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
    enum: ["owner", "admin", "user"]
  }
})

export default mongoose.model("user", userSchema)
