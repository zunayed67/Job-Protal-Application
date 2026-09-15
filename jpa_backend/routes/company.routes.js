import express from 'express';
import { addCompany, deleteCompany, getCompanies } from '../controller/company.controller.js';
import { authMiddleware, authorize } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadmiddleware.js';

const companyRouter = express.Router();

companyRouter.get('/', getCompanies);
companyRouter.post('/', authMiddleware, authorize("admin"), upload.single("logo"), addCompany);
companyRouter.delete('/:id', authMiddleware, authorize("admin"), deleteCompany);

export default companyRouter;