import httpStatus from "http-status";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        
        // Extract token from Bearer header or x-access-token header
        let token = null;
        
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7);
        } else if (req.headers["x-access-token"]) {
            token = req.headers["x-access-token"];
        } else if (req.body?.token) {
            token = req.body.token;
        } else if (req.query?.token) {
            token = req.query.token;
        }

        if (!token) {
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: "Authentication token is required" 
            });
        }

        // Verify JWT token with RSA public key
        const decoded = verifyToken(token);
        
        // Attach user info to request from JWT payload
        req.user = {
            id: decoded.id,
            username: decoded.username
        };

        next();
    } catch (error) {
        // Handle different JWT errors
        if (error.message.includes("expired")) {
            return res.status(httpStatus.UNAUTHORIZED).json({ 
                message: "Token has expired" 
            });
        }
        
        return res.status(httpStatus.UNAUTHORIZED).json({ 
            message: "Invalid authentication token" 
        });
    }
};
