import httpStatus from "http-status";
import bcrypt from "bcrypt";
import {
    findUserByUsername,
    createUser,
    updateUserToken
} from "../models/user.model.js";
import { findMeetingsByUserId, createMeeting } from "../models/meeting.model.js";
import { generateToken, generateRefreshToken } from "../utils/jwt.js";

const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Username and password are required" });
    }

    try {
        const user = await findUserByUsername(username.trim());
        if (!user) {
            return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid username or password" });
        }

        // Generate JWT tokens with RSA-256
        const accessToken = generateToken(
            { id: user.id, username: user.username },
            "1h" // Access token expires in 1 hour
        );
        const refreshToken = generateRefreshToken(
            { id: user.id, username: user.username }
        );

        // Store refresh token in database (optional - for token blacklisting)
        // Don't fail if token storage fails, JWT is still valid
        try {
            await updateUserToken(user.id, refreshToken);
        } catch (dbError) {
            console.warn("⚠️ Failed to store refresh token in DB (non-critical):", dbError.message);
        }

        return res.status(httpStatus.OK).json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                username: user.username,
                name: user.name
            }
        });
    } catch (e) {
        console.error("❌ Login error:", e);
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ 
            message: "Something went wrong",
            error: process.env.NODE_ENV === 'development' ? e.message : undefined 
        });
    }
};

const register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Name, username and password are required" });
    }

    try {
        const existingUser = await findUserByUsername(username.trim());
        if (existingUser) {
            return res.status(httpStatus.CONFLICT).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password.trim(), 10);
        await createUser(name.trim(), username.trim(), hashedPassword);

        return res.status(httpStatus.CREATED).json({ message: "User registered" });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
    }
};

const getUserHistory = async (req, res) => {
    try {
        const meetings = await findMeetingsByUserId(req.user.id);
        return res.status(httpStatus.OK).json(meetings);
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
    }
};

const addToHistory = async (req, res) => {
    const meeting_code = req.body.meeting_code;

    if (!meeting_code || typeof meeting_code !== "string" || !meeting_code.trim()) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "A valid meeting code is required" });
    }

    try {
        await createMeeting(req.user.id, meeting_code.trim());
        return res.status(httpStatus.CREATED).json({ message: "Added code to history" });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: "Something went wrong" });
    }
};

export { login, register, getUserHistory, addToHistory }