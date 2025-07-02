import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import { asyncError } from "./error.js";

export const isAuthenticated = asyncError(async (req, res, next) => {

  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler("No token", 401));
  }
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData._id);
  next();
});

export const isAdmin = asyncError(async (req, res, next) => {
  if (req.user.role !== "admin")
    return next(new ErrorHandler("Only Admin allowed", 401));
  next();
});
