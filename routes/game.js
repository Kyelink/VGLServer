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

/**
 * @swagger
 * /api/v1/game/single/{id}:
 *   get:
 *     summary: Récupère les détails d’un jeu par son ID
 *     tags:
 *       - Jeux
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID MongoDB du jeu
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du jeu
 *       404:
 *         description: Jeu non trouvé
 */
router.get("/single/:id", getGameDetails);

/**
 * @swagger
 * /api/v1/game/scrap:
 *   get:
 *     summary: Scrappe les données d’un jeu Steam (tags, reviews)
 *     tags:
 *       - Jeux
 *     parameters:
 *       - in: query
 *         name: appid
 *         required: true
 *         description: ID Steam du jeu
 *         schema:
 *           type: string
 *       - in: query
 *         name: language
 *         required: false
 *         description: Langue (french, english, etc.)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Données Steam scrappées
 *       400:
 *         description: Paramètres manquants ou invalides
 */
router.get("/scrap", scrapGame);

/**
 * @swagger
 * /api/v1/game/all:
 *   get:
 *     summary: Recherche et liste les jeux depuis la base de données, par pages de 36 resultats maximum
 *     tags:
 *       - Jeux
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: false
 *         description: Mot-clé pour filtrer les jeux par titre
 *         schema:
 *           type: string
 *       - in: query
 *         name: nsfw
 *         required: false
 *         description: Inclure les jeux NSFW (true ou false)
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: offset
 *         required: false
 *         description: Décalage pour la pagination
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste filtrée des jeux
 */
router.get("/all", getSearchedGames);

/**
 * @swagger
 * /api/v1/game/recommended:
 *   get:
 *     summary: Recommandation de jeux personnalisée
 *     tags:
 *       - Jeux
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste recommandée basée sur les favoris
 *       401:
 *         description: Non authentifié
 */
router.get("/recommended", isAuthenticated, getRecommendedGames);

/**
 * @swagger
 * /api/v1/game/new:
 *   post:
 *     summary: Créer un nouveau jeu (admin requis)
 *     tags:
 *       - Jeux
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Game'
 *     responses:
 *       201:
 *         description: Jeu créé
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès interdit (non admin)
 */
router.post("/new", isAuthenticated, isAdmin, createGame);


export default router;
