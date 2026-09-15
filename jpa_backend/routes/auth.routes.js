import express from 'express'
import { forgotPassword, login, register, resetPassword, verifyEmail } from '../controller/auth.controller.js';

const authRouter = express.Router();

authRouter.post("/register", register)
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;