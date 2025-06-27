import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import validator from "validator";

const schema = new mongoose.Schema({

  //  User's main informations
  username: {
    type: String,
    unique: true,
    required: [true, "Please enter username"],
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    unique: true,
    validate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "Please enter password"],
    minLength: [6, "Password must be at least 6 character long"],
    select: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },

  //  User's preferences
  language: {
    type: String,
    enum: ["en", "fr"],
    default: "en",
  },
  darkmode: {
    type: Boolean,
    default: true,
  },
  nsfw: {
    type: Boolean,
    default: false,
  },

  //  User's favourited games informations
  fav_games_list: {
    type: [
      {
        _id: String,
        name: String,
        image: String,
        tags: [String],
      },
    ],
    default: [],
  },
  fav_tags_list: {
    // type: [{
    //     tag: String,
    //     count: Number,
    // }],
    type: Object,
    default: {},
  },
  need_to_recalculate: {
    type: Boolean,
    default: true,
  },
  top_fav_tags_list: {
    type: [String],
    default: [],
  },

  //  User's password reset informations
  otp: Number,
  otp_expire: Date,
});


schema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});
schema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
schema.methods.generateToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};

export const User = mongoose.model("User", schema);
