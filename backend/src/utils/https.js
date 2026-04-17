import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certsDir = path.join(__dirname, "../certs");

/**
 * Load SSL/TLS certificates for HTTPS
 * @returns {Object} { key: string, cert: string } or null if certs not found
 */
export const loadSSLCertificates = () => {
    try {
        const keyPath = path.join(certsDir, "private.key");
        const certPath = path.join(certsDir, "certificate.crt");

        if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
            console.warn("⚠️  SSL certificates not found. Running in HTTP mode.");
            console.warn("   For production, add certificates to:", certsDir);
            return null;
        }

        const key = fs.readFileSync(keyPath, "utf8");
        const cert = fs.readFileSync(certPath, "utf8");

        console.log("✅ SSL/TLS certificates loaded");
        return { key, cert };
    } catch (error) {
        console.error("Error loading SSL certificates:", error.message);
        return null;
    }
};

/**
 * Create HTTPS server with SSL/TLS support
 * @param {Object} app - Express app
 * @param {Object} options - Options { port, sslCerts }
 * @returns {Object} HTTP or HTTPS server
 */
export const createSecureServer = (app, options = {}) => {
    const { port = 8000, sslCerts = null } = options;

    // Check if SSL certificates are available
    const certs = sslCerts || loadSSLCertificates();

    let server;

    if (certs) {
        // Create HTTPS server
        server = https.createServer(
            {
                key: certs.key,
                cert: certs.cert,
                // Additional security options
                honorCipherOrder: true,
                secureOptions:
                    require("constants").SSL_OP_NO_TLSv1 |
                    require("constants").SSL_OP_NO_TLSv1_1 // Disable older TLS versions
            },
            app
        );
        console.log("🔒 HTTPS server configured");
    } else {
        // Fall back to HTTP
        const http = require("http");
        server = http.createServer(app);
        console.warn("⚠️  Running in HTTP mode (not recommended for production)");
    }

    return server;
};

/**
 * Middleware to enforce HTTPS redirect (optional)
 * Only enable behind a proxy that handles SSL termination
 */
export const httpsRedirectMiddleware = (req, res, next) => {
    if (process.env.NODE_ENV === "production" && req.header("x-forwarded-proto") !== "https") {
        return res.redirect(`https://${req.header("host")}${req.url}`);
    }
    next();
};
