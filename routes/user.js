import express from 'express';
import { addFavGame, changePassword, deleteAccount, forgetPassword, getMyProfile, getUniqueUsername, login, logOut, removeFavGame, resetPassword, signup, updatePic, updateProfile } from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';

const router = express.Router();




router.post("/login", login);
router.post("/signup", singleUpload, signup);




router.get("/me", isAuthenticated, getMyProfile);
router.get("/uniqueusername", getUniqueUsername);
router.get("/logout", isAuthenticated, logOut);


router.put("/updateprofile", isAuthenticated, updateProfile);
router.put("/changepassword", isAuthenticated, changePassword);
router.put("/updatepic", isAuthenticated, singleUpload, updatePic);
router.put("/addfavgame/:id", isAuthenticated, addFavGame);
router.put("/removefavgame/:id", isAuthenticated, removeFavGame);
router.route("/forgetpassword").put(resetPassword).post(forgetPassword);

router.delete("/deleteprofile", isAuthenticated, deleteAccount);

export default router;
