import express from "express";
import { authenticate, restrict } from "../utils/verifyToken.js";
import { getAllUsers } from "../Controllers/userController.js";

const router = express.Router();

router.get("/getAllUsers", authenticate, restrict(["admin"]), getAllUsers);

export default router;
