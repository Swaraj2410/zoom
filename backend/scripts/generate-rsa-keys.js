import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const keysDir = path.join(__dirname, "../keys");

// Create keys directory if it doesn't exist
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
}

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: "spki",
        format: "pem"
    },
    privateKeyEncoding: {
        type: "pkcs8",
        format: "pem"
    }
});

// Save keys to files
fs.writeFileSync(path.join(keysDir, "private.key"), privateKey);
fs.writeFileSync(path.join(keysDir, "public.key"), publicKey);

console.log("✅ RSA key pair generated successfully!");
console.log(`📁 Private key: ${path.join(keysDir, "private.key")}`);
console.log(`📁 Public key: ${path.join(keysDir, "public.key")}`);
console.log("\n⚠️  Keep the private.key file secure and never share it!");
