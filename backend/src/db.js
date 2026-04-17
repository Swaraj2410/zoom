import dotenv from "dotenv";
import pkg from "pg";
const { Pool } = pkg;

dotenv.config();

let pool;

export const initDb = async () => {
    const { 
        DATABASE_URL,
        DB_HOST, 
        DB_PORT, 
        DB_USER, 
        DB_PASSWORD, 
        DB_NAME,
        DB_SSL,
        // Fallback to MYSQL_* for backward compatibility
        MYSQL_HOST,
        MYSQL_PORT,
        MYSQL_USER,
        MYSQL_PASSWORD,
        MYSQL_DATABASE
    } = process.env;

    // Use DB_* variables if available, otherwise fall back to MYSQL_*
    const host = DB_HOST || MYSQL_HOST;
    const port = DB_PORT || MYSQL_PORT || 5432;
    const user = DB_USER || MYSQL_USER;
    const password = DB_PASSWORD || MYSQL_PASSWORD;
    const database = DB_NAME || MYSQL_DATABASE;
    const useSsl = DB_SSL === "true" || Boolean(DATABASE_URL && DATABASE_URL.includes("render.com"));

    if (!DATABASE_URL && (!host || !user || !password || !database)) {
        console.error("Missing database environment variables.");
        console.error("Set DATABASE_URL or: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME");
        console.error("Or: MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE");
        process.exit(1);
    }

    pool = new Pool(
        DATABASE_URL
            ? {
                  connectionString: DATABASE_URL,
                  ssl: useSsl ? { rejectUnauthorized: false } : false,
                  max: 10,
                  idleTimeoutMillis: 30000,
                  connectionTimeoutMillis: 5000,
              }
            : {
                  host,
                  port: Number(port),
                  user,
                  password,
                  database,
                  ssl: useSsl ? { rejectUnauthorized: false } : false,
                  max: 10,
                  idleTimeoutMillis: 30000,
                  connectionTimeoutMillis: 5000,
              }
    );

    try {
        const connection = await pool.connect();
        const result = await connection.query("SELECT NOW()");
        console.log("PostgreSQL connected version:", result.rows[0]);
        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
};

export const getPool = () => {
    if (!pool) {
        throw new Error("Database pool has not been initialized.");
    }
    return pool;
};
