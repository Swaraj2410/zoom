import httpStatus from "http-status";
import { findUserByToken } from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.slice(7)
            : req.headers["x-access-token"] || req.body.token || req.query.token;

        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Authentication token is required" });
        }

        const user = await findUserByToken(token);
        if (!user) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid or expired authentication token" });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Authentication failed" });
    }
};
