import express from 'express';
import { authMiddleware, authorize } from '../middleware/authMiddleware.js';
import { applyJob, getApplication, getUserApplications } from '../controller/Application.controller.js';



const applicationRouter = express.Router();

applicationRouter.post('/apply/:id', authMiddleware, applyJob);
applicationRouter.get('/user', authMiddleware, getUserApplications);
applicationRouter.get('/:id/applicants', authMiddleware, authorize("admin"), getApplication);

export default applicationRouter;