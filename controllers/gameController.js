import { createRequire } from 'node:module';
import { asyncError } from "../middlewares/error.js";
import { Game } from "../models/game.js";
import { User } from "../models/user.js";
import ErrorHandler from "../utils/errorHandler.js";
const require = createRequire(import.meta.url);
const cheerio = require('cheerio');

const limit = 36;
const minTags = 5;

const nsfwTags = ["Hentai", "Hentaï", "hentai", "hentaï", "Sex", "sex", "Adult","adult","porn","Porn","pornography","Pornography","sexual","Sexual",
    "Adult Content", "NSFW", "nsfw", "Nudity", "Sexual Content"
];
const selector = "name platforms genres release_date header_image";

const calculateFavTag = (tagList) => {
  const keys = Object.keys(tagList);
  const tagArray = [];
  for (const key of keys) {
    tagArray.push({ tag: key, count: tagList[key] });
  }
  tagArray.sort((a, b) => {
    if (a.count < b.count) {
      return -1;
    }
    if (a.count > b.count) {
      return 1;
    }
    return 0;
  });
  let limitRank = -1;
  if (tagArray.length > minTags) {
    limitRank = tagArray[tagArray.length - minTags].count;
  }
  const favTags = [];
  for (const tag of tagArray) {
    if (tag.count >= limitRank) {
      favTags.push(tag.tag);
    }
  }
  return favTags;
};

export const getGameDetails = asyncError(async (req, res, next) => {
  const game = await Game.findById(req.params.id);
  if (!game) {
    return next(new ErrorHandler("no game found", 401));
  }
  res.status(200).json({
    success: true,
    game,
  });
});
export const getRecommendedGames = asyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("no user found", 401));
  }
  const favTags = user.need_to_recalculate
    ? calculateFavTag(user.fav_tags_list)
    : user.top_fav_tags_list;
  user.need_to_recalculate = false;
  user.top_fav_tags_list = favTags;
  await user.save();
  // console.log("recommended tags : " + JSON.stringify(favTags));

  let { offset } = req.query;
  const query = {
    tags: { $in: favTags },
  };

  const count = await Game.countDocuments(query);
  const games = await Game.find(query, selector)
    .skip(limit * offset)
    .limit(limit);

  res.status(200).json({
    success: true,
    // favoritesTags: favTags,
    size: count,
    games,
  });
});
export const getSearchedGames = asyncError(async (req, res, next) => {
  let { keyword, nsfw, offset } = req.query;
  const query =
    nsfw === "true"
      ? {
          name: {
            $regex: keyword ? keyword : "",
            $options: "i",
          },
        }
      : {
          name: {
            $regex: keyword ? keyword : "",
            $options: "i",
          },
          tags: { $nin: nsfwTags },
        };
  const count = await Game.countDocuments(query);
  const games = await Game.find(query, selector)
    .skip(limit * offset)
    .limit(limit);
  res.status(200).json({
    success: true,
    size: count,
    games,
  });
});
export const createGame = asyncError(async (req, res, next) => {
  const {
    name,
    description,
    steam_appid,
    required_age,
    is_free,
    dlc,
    release_date,
    header_image,
    developers,
    publishers,
    platforms,
    genres,
    tags,
    screenshots,
    movies,
    descriptions,
  } = req.body;

  const game = await Game.create({
    name,
    description,
    steam_appid,
    required_age,
    is_free,
    dlc,
    release_date,
    header_image,
    developers,
    publishers,
    platforms,
    genres,
    tags,
    screenshots,
    movies,
    descriptions,
  });
  res.status(200).json({
    success: true,
    message: "Game created successfully!",
    game,
  });
});

export const scrapGame = asyncError(async (req, res, next) => {
  let { appid, language } = req.query;
  if (!isValidAppid(appid)) {
    return next(new ErrorHandler("appid invalid", 401));
  }
  const url = `https://store.steampowered.com/app/${appid}/?l=${language}`;

  const res2 = await fetch(url);
  const html = await res2.text();
  const $ = cheerio.load(html);

  const tags = [];
  $(".glance_tags a").each((i, element) => {
    tags.push($(element).text().trim());
  });

  const rating = $(".user_reviews_summary_row .responsive_reviewdesc_short");
  const mention = $(".user_reviews_summary_row .game_review_summary");
  const reviews = [];
  rating.each((i, element) => {
    reviews.push({
      rating: $(element).text().trim(),
      mention: $(mention[i]).text().trim(),
    });
  });
  res.status(200).json({
    success: true,
    tags: tags,
    reviews: reviews,
  });
});

const isValidAppid = (appid) => {
  if (isNaN(appid)) {
    return false;
  }
  if (appid < 0) {
    return false;
  }
  return true;
};
