import express from "express";
import {
  createGame,
  getGameDetails,
  getRecommendedGames,
  getSearchedGames,
  scrapGame,
} from "../controllers/gameController.js";
import { isAdmin, isAuthenticated } from "../middlewares/auth.js";


const router = express.Router();

router.get("/single/:id", getGameDetails);
router.get("/scrap", scrapGame);
router.get("/all", getSearchedGames);
router.get("/recommended", isAuthenticated, getRecommendedGames);
router.post("/new", isAuthenticated, isAdmin, createGame);


export default router;
