import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/auth-midddleware.js";

//Rote level middleware - to protect route
router.use("/changepassword", checkUserAuth);
router.use("/loggeduser", checkUserAuth);

//public routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);

//protected routes
router.post("/changepassword", UserController.changeUserPassword);
router.get("/loggeduser", UserController.loggedUser);

export default router;
