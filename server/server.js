import "dotenv/config";
import cookieParser from "cookie-parser";
import express from "express"
import cors from 'cors'
import connectDB from "./config/db.js";
import userRouter from "./router/UserRoute.js";
import sellerRouter from "./router/sellerRoute.js";

const app = express();
const PORT = process.env.PORT || 4000;

await connectDB();

// Allow multiple origin 
const allowOrigins = ['http://localhost:5173']; 

// Middleware config:
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: allowOrigins, credentials: true}));

app.get("/", (req, res) => {
    res.send("API is working ...");
});

app.use('/api/user', userRouter);
app.use('/api/seller', sellerRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});