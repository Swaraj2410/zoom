import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";

import { connectToSocket } from "./controllers/socketManager.js";

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import userRoutes from "./routes/users.routes.js";
import { initDb, getPool } from "./db.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
const server = createServer(app);
const io = connectToSocket(server);


app.set("port", (process.env.PORT || 8000));

app.use(helmet());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later."
});

app.use("/api/", apiLimiter);

// CORS configuration - allow only the configured frontend origin if provided
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const start = async () => {
    await initDb();
    const pool = getPool();
    const [rows] = await pool.query("SELECT VERSION() AS version");
    console.log(`MySQL connected version: ${rows[0].version}`);

    server.listen(app.get("port"), () => {
        console.log(`LISTENING ON PORT ${app.get("port")}`);
    });
};

start();