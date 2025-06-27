import express from 'express';
import { addFavGame, changePassword, deleteAccount, forgetPassword, getMyProfile, getUniqueUsername, login, logOut, removeFavGame, resetPassword, signup, updatePic, updateProfile } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';

const router = express.Router();



/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Connexion d’un utilisateur existant
 *     tags:
 *       - Utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joueur@exemple.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Connexion réussie, retour du token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Email ou mot de passe incorrect
 */
router.post("/login", login);

/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags:
 *       - Utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: player123
 *               email:
 *                 type: string
 *                 format: email
 *                 example: player@example.com
 *               password:
 *                 type: string
 *                 example: mysecurepassword
 *               language:
 *                 type: string
 *                 enum: [en, fr]
 *                 example: fr
 *               darkmode:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Utilisateur inscrit avec succès
 *       400:
 *         description: Données invalides ou utilisateur déjà existant
 */
router.post("/signup", singleUpload, signup);

/**
 * @swagger
 * /api/v1/user/forgetpassword:
 *   post:
 *     summary: Envoie un code OTP de réinitialisation à l'email fourni
 *     tags:
 *       - Utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: player@example.com
 *     responses:
 *       200:
 *         description: OTP envoyé à l'adresse email si elle est enregistrée
 *       404:
 *         description: Email non trouvé dans la base de données
 */
router.post("/forgetpassword",forgetPassword);

/**
 * @swagger
 * /api/v1/user/me:
 *   get:
 *     summary: Récupère les informations du profil utilisateur connecté
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié ou token invalide
 */
router.get("/me", isAuthenticated, getMyProfile);

/**
 * @swagger
 * /api/v1/user/uniqueusername:
 *   get:
 *     summary: Génère un nom d'utilisateur unique aléatoire
 *     tags:
 *       - Utilisateur
 *     responses:
 *       200:
 *         description: Nom d'utilisateur unique généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: gamer_5491
 */
router.get("/uniqueusername", getUniqueUsername);

/**
 * @swagger
 * /api/v1/user/logout:
 *   get:
 *     summary: Déconnexion de l'utilisateur
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged Out"
 *       401:
 *         description: Non autorisé
 */
router.get("/logout", isAuthenticated, logOut);

/**
 * @swagger
 * /api/v1/user/updateprofile:
 *   put:
 *     summary: Met à jour le profil utilisateur
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: "nouveau_username"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nouveau@email.com"
 *               language:
 *                 type: string
 *                 example: "fr"
 *               darkmode:
 *                 type: boolean
 *                 example: true
 *               nsfw:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile Updated Successfully"
 *       401:
 *         description: Utilisateur non trouvé
 */
router.put("/updateprofile", isAuthenticated, updateProfile);

/**
 * @swagger
 * /api/v1/user/changepassword:
 *   put:
 *     summary: Change le mot de passe de l'utilisateur
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "ancien_mot_de_passe"
 *               newPassword:
 *                 type: string
 *                 example: "nouveau_mot_de_passe"
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed!"
 *       400:
 *         description: Mot de passe incorrect
 *       401:
 *         description: Utilisateur non trouvé
 */
router.put("/changepassword", isAuthenticated, changePassword);

/**
 * @swagger
 * /api/v1/user/updatepic:
 *   put:
 *     summary: Met à jour la photo de profil de l'utilisateur
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image à uploader pour l'avatar
 *     responses:
 *       200:
 *         description: Avatar mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Avatar changed"
 *       401:
 *         description: Utilisateur non trouvé
 */
router.put("/updatepic", isAuthenticated, singleUpload, updatePic);

/**
 * @swagger
 * /api/v1/user/addfavgame/{id}:
 *   put:
 *     summary: Ajoute un jeu aux favoris de l'utilisateur
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du jeu à ajouter aux favoris
 *         example: "64a1b2c3d4e5f6789012345"
 *     responses:
 *       200:
 *         description: Jeu ajouté aux favoris avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Game Added Successfully"
 *       401:
 *         description: Utilisateur non trouvé ou jeu invalide ou jeu déjà en favoris
 */
router.put("/addfavgame/:id", isAuthenticated, addFavGame);

/**
 * @swagger
 * /api/v1/user/removefavgame/{id}:
 *   put:
 *     summary: Retire un jeu des favoris de l'utilisateur
 *     tags:
 *       - Utilisateur
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du jeu à retirer des favoris
 *         example: "64a1b2c3d4e5f6789012345"
 *     responses:
 *       200:
 *         description: Jeu retiré des favoris avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Game Removed Successfully"
 *       401:
 *         description: Utilisateur non trouvé ou jeu non valide
 */
router.put("/removefavgame/:id", isAuthenticated, removeFavGame);

/**
 * @swagger
 * /api/v1/user/forgetpassword:
 *   put:
 *     summary: Réinitialise le mot de passe avec OTP
 *     tags:
 *       - Utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *               - password
 *             properties:
 *               otp:
 *                 type: string
 *                 example: "123456"
 *                 description: Code OTP reçu par email
 *               password:
 *                 type: string
 *                 example: "nouveau_mot_de_passe"
 *                 description: Nouveau mot de passe
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: OTP incorrect ou expiré, ou mot de passe manquant
 */
router.put("/forgetpassword",resetPassword);

/**
* @swagger
* /api/v1/user/deleteprofile:
*   delete:
*     summary: Supprime le compte utilisateur
*     tags:
*       - Utilisateur
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: Compte supprimé avec succès
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 message:
*                   type: string
*                   example: "Account deleted"
*       401:
*         description: Utilisateur non trouvé
*/
router.delete("/deleteprofile", isAuthenticated, deleteAccount);

export default router;
