const validator = require("validator");
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
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
      validate: [validator.isEmail, "Invalid email address"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      // required: true,
      unique: true,
      match: /^01[0125][0-9]{8}$/,
    },
    token: {
      type: String,
      default: null,
    },
  },
  { timestamps: true, minimize: false },
);
const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;
