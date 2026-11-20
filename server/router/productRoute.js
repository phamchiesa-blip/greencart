import express from 'express'
import {upload} from '../config/multer.js'
import { addProduct, productList, productById, changeStock } from '../controllers/productController.js';
import authSeller from '../middleware/authSeller.js'

const productRouter = express.Router();

productRouter.post("/add", upload.array([images]), authSeller, addProduct);
productRouter.get("/list", productList);
productRouter.get("/add", productById);
productRouter.post("/stock", authSeller, changeStock);

export default productRouter;