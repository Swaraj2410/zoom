import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(__dirname, "../../keys");

let privateKey = null;
let publicKey = null;

/**
 * Load RSA keys from files
 */
const loadKeys = () => {
    try {
        const privateKeyPath = path.join(keysDir, "private.key");
        const publicKeyPath = path.join(keysDir, "public.key");

        if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
            throw new Error(
                "RSA keys not found. Please run: npm run generate-keys"
            );
        }

        privateKey = fs.readFileSync(privateKeyPath, "utf8");
        publicKey = fs.readFileSync(publicKeyPath, "utf8");
    } catch (error) {
        console.error("Error loading RSA keys:", error.message);
        process.exit(1);
    }
};

// Load keys on module import
loadKeys();

/**
 * Generate JWT token signed with RSA private key
 * @param {Object} payload - Token payload data
 * @param {number} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} JWT token
 */
export const generateToken = (payload, expiresIn = "7d") => {
    try {
        const token = jwt.sign(payload, privateKey, {
            algorithm: "RS256",
            expiresIn
        });
        return token;
    } catch (error) {
        throw new Error(`Token generation failed: ${error.message}`);
    }
};

/**
 * Verify JWT token signed with RSA public key
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, publicKey, {
            algorithms: ["RS256"]
        });
        return decoded;
    } catch (error) {
        throw new Error(`Token verification failed: ${error.message}`);
    }
};

/**
 * Generate refresh token (longer expiration)
 * @param {Object} payload - Token payload data
 * @returns {string} Refresh token
 */
export const generateRefreshToken = (payload) => {
    return generateToken(payload, "30d");
};

/**
 * Decode token without verification (use with caution)
 * @param {string} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        throw new Error(`Token decode failed: ${error.message}`);
    }
};
