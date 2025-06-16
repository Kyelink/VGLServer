import cloudinary from "cloudinary";
import { asyncError } from "../middlewares/error.js";
import { Game } from "../models/game.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
import {
  cookieOptions,
  customUniqueUsername,
  getDataUri,
  sendEmail,
  sendToken,
} from "../utils/features.js";

export const getUniqueUsername = asyncError(async (req, res, next) => {
  var uniqueUsername = customUniqueUsername();
  var user = await User.find({ username: uniqueUsername });
  while (user.length > 0) {
    uniqueUsername = customUniqueUsername();
    user = await User.find({ username: uniqueUsername });
  }
  res.status(200).json({
    success: true,
    uniqueUsername,
  });
});
export const login = asyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Email isn't registered", 401));
  }
  const match = await user.comparePassword(password);
  if (!match) {
    return next(new ErrorHandler("Incorrect password", 400));
  }
  sendToken(user, res, user.username + " logged!", 200);
});
export const signup = asyncError(async (req, res, next) => {
  const { username, email, password, language, darkmode } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exist", 400));
  }

  let avatar = undefined;
  if (req.file) {
    const file = getDataUri(req.file);

    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    avatar = {
      url: myCloud.secure_url,
      public_id: myCloud.public_id,
    };
  }
  user = await User.create({
    username,
    email,
    password,
    avatar,
    language,
    darkmode,
  });
  sendToken(user, res, "registered successfully", 200);
});

export const getMyProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("no user found", 401));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

export const logOut = asyncError((req, res, next) => {
  res
    .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
    .status(200)
    .json({
      success: true,
      message: "Logged Out",
    });
});
export const updateProfile = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("no user found", 401));
  }
  const { username, email, language, darkmode, nsfw } = req.body;

  if (username) {
    user.username = username;
  }
  if (email) {
    user.email = email;
  }
  if (language) {
    user.language = language;
  }
  if (darkmode === false || darkmode === true) {
    user.darkmode = darkmode;
  }
  if (nsfw === false || nsfw === true) {
    user.nsfw = nsfw;
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Profile Updated Successfully",
  });
});
export const addFavGame = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("no user found", 401));
  }
  const game = await Game.findById(req.params.id);
  // const { game } = req.body;

  if (!game) {
    return next(new ErrorHandler("No valid game to add", 401));
  }
  // let gameFound = null;
  for (const gameItem of user.fav_games_list) {
    if (game._id.toString() === gameItem._id.toString()) {
      return next(new ErrorHandler("Duplicate game to add", 401));
    }
  }
  user.fav_games_list.push({
    _id: game._id,
    name: game.name,
    image: game.header_image,
    tags: game.tags,
  });
  const cp = JSON.parse(JSON.stringify(user.fav_tags_list));
  for (const tag of game.tags) {
    if (cp[tag]) {
      cp[tag]++;
    } else {
      cp[tag] = 1;
    }
  }
  user.fav_tags_list = cp;
  user.need_to_recalculate = true;
  await user.save();
  game.likes++;
  await game.save();
  res.status(200).json({
    success: true,
    message: "Game Added Successfully",
  });
});
export const removeFavGame = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("no user found", 401));
  }

  if (!req.params.id) {
    return next(new ErrorHandler("No valid game to remove", 401));
  }
  let gameFound = null;
  for (const game of user.fav_games_list) {
    if (game._id === req.params.id) {
      gameFound = game;
      break;
    }
  }
  if (!gameFound) {
    return next(new ErrorHandler("No valid game to remove", 401));
  }
  console.log("game found : " + gameFound);
  user.fav_games_list.remove(gameFound);

  const cp = JSON.parse(JSON.stringify(user.fav_tags_list));
  for (const tag of gameFound.tags) {
    cp[tag]--;
  }
  user.fav_tags_list = cp;
  user.need_to_recalculate = true;
  await user.save();


  const game = await Game.findById(req.params.id);
  game.likes--;
  await game.save();
  res.status(200).json({
    success: true,
    message: "Game Removed Successfully",
  });
});
export const changePassword = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");

  const { oldPassword, newPassword } = req.body;
  const match = await user.comparePassword(oldPassword);
  if (!match) {
    return next(new ErrorHandler("Incorrect password", 400));
  }
  if (newPassword) {
    user.password = newPassword;
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed!",
  });
});
export const updatePic = asyncError(async (req, res, next) => {
  console.log("updating pic");
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("no user found", 401));
  }

  if (req.file) {
    const file = getDataUri(req.file);
    if (user.avatar && user.avatar.public_id) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    }
    const myCloud = await cloudinary.v2.uploader.upload(file.content);
    user.avatar = {
      url: myCloud.secure_url,
      public_id: myCloud.public_id,
    };
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: "Avatar changed",
  });
});

export const deleteAccount = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("no user found", 401));
  }

  if (user.avatar && user.avatar.public_id) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  }
  await user.deleteOne();

  res
  .cookie("token", "", {
      ...cookieOptions,
      expires: new Date(Date.now()),
    })
  .status(200)
  .json({
    success: true,
    message: "Account deleted",
  });
});

export const forgetPassword = asyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("no user found", 404));
  }

  user.otp = Math.floor(Math.random() * (999999 - 100000) + 100000);
  user.otp_expire = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  const message =
    "Your OTP for reseting password is " +
    user.otp +
    ". \nPlease ignore if you haven't requested this.";
  try {
    await sendEmail("OTP for reseting password", user.email, message);
  } catch (error) {
    user.otp = null;
    user.otp_expire = null;
    await user.save();
    return next(error);
  }
  res.status(200).json({
    success: true,
    message: "Email sent to " + user.email,
  });
});
export const resetPassword = asyncError(async (req, res, next) => {
  // console.log()
  const { otp, password } = req.body;
  //no enough security
  const user = await User.findOne({
    otp,
    otp_expire: {
      $gt: Date.now(),
    },
  });
  console.log({ mail: user.email });
  if (!user) {
    return next(new ErrorHandler("OTP incorrect or expired", 400));
  }
  if (!password) {
    return next(new ErrorHandler("Enter password", 400));
  }
  user.password = password;
  user.otp = null;
  user.otp_expire = null;

  await user.save();
  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});
