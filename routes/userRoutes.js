import express from "express";
const router = express.Router();
import UserController from "../controllers/userController.js";

//user registration
router.post("/register", UserController.userRegistration);

export default router;
