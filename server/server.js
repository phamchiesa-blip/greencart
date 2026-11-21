import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express"
import cors from 'cors'
import connectDB from "./config/db.js";
import userRouter from "./router/UserRoute.js";
import sellerRouter from "./router/sellerRoute.js";
import connectCloudinary from './config/cloudinary.js'
import productRouter from "./router/productRoute.js";
import cartRouter from './router/cartRoute.js'
import addressRouter from "./router/addressRoute.js";
import orderRouter from "./router/orderRoute.js";
import { stripeWebhooks } from "./controllers/orderController.js";

const app = express();
const PORT = process.env.PORT || 4000;

await connectDB();
await connectCloudinary();

// Allow multiple origin 
const allowOrigins = ['http://localhost:5173']; 
if (process.env.CLIENT_URL) {
    allowOrigins.push(process.env.CLIENT_URL);
}

app.post('/stripe', express.raw({type: 'application/json'}), stripeWebhooks);

// Middleware config:
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.get("/", (req, res) => {
    res.send("API is working ...");
});

app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);
app.use('/api/product', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/address', addressRouter);
app.use('/api/order', orderRouter);


if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;