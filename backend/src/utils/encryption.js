import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Generates a 32-byte encryption key from a password using PBKDF2
 * @param {string} password - The password to derive the key from
 * @param {Buffer} salt - The salt to use (generated if not provided)
 * @returns {Object} { key: Buffer, salt: Buffer }
 */
export const generateKeyFromPassword = (password, salt = null) => {
    const saltToUse = salt || crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(password, saltToUse, 100000, 32, "sha256");
    return { key, salt: saltToUse };
};

/**
 * Encrypts data using AES-256-GCM
 * @param {string|Buffer} plaintext - Data to encrypt
 * @param {Buffer} key - Encryption key (32 bytes)
 * @returns {string} Base64 encoded encrypted data (salt:iv:tag:ciphertext)
 */
export const encryptAES = (plaintext, key) => {
    if (!key || key.length !== 32) {
        throw new Error("Encryption key must be 32 bytes");
    }

    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");

    const tag = cipher.getAuthTag();

    // Combine: salt:iv:tag:ciphertext
    const combined = iv.toString("hex") + ":" + tag.toString("hex") + ":" + encrypted;
    return Buffer.from(combined).toString("base64");
};

/**
 * Decrypts data encrypted with encryptAES
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {Buffer} key - Decryption key (32 bytes)
 * @returns {string} Decrypted plaintext
 */
export const decryptAES = (encryptedData, key) => {
    if (!key || key.length !== 32) {
        throw new Error("Decryption key must be 32 bytes");
    }

    try {
        const combined = Buffer.from(encryptedData, "base64").toString("hex");
        const parts = combined.split(":");
        
        if (parts.length !== 3) {
            throw new Error("Invalid encrypted data format");
        }

        const iv = Buffer.from(parts[0], "hex");
        const tag = Buffer.from(parts[1], "hex");
        const ciphertext = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(ciphertext, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error) {
        throw new Error(`Decryption failed: ${error.message}`);
    }
};

/**
 * Encrypts an object by converting it to JSON
 * @param {Object} obj - Object to encrypt
 * @param {Buffer} key - Encryption key (32 bytes)
 * @returns {string} Base64 encoded encrypted data
 */
export const encryptObject = (obj, key) => {
    const jsonString = JSON.stringify(obj);
    return encryptAES(jsonString, key);
};

/**
 * Decrypts an object encrypted with encryptObject
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @param {Buffer} key - Decryption key (32 bytes)
 * @returns {Object} Decrypted object
 */
export const decryptObject = (encryptedData, key) => {
    const decrypted = decryptAES(encryptedData, key);
    return JSON.parse(decrypted);
};
