import express from "express";
import { submitInquiry } from "../controller/inquiry.controller.js";


const inqueryRouter = express.Router();

inqueryRouter.post('/', submitInquiry);

export default inqueryRouter;