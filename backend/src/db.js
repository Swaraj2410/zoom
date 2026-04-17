import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

let pool;

export const initDb = async () => {
    const { MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE } = process.env;

    if (!MYSQL_HOST || !MYSQL_USER || !MYSQL_PASSWORD || !MYSQL_DATABASE) {
        console.error("Missing MySQL environment variables. Please set MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE.");
        process.exit(1);
    }

    pool = mysql.createPool({
        host: MYSQL_HOST,
        port: Number(MYSQL_PORT || 3306),
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        namedPlaceholders: true
    });

    const connection = await pool.getConnection();
    connection.release();
};

export const getPool = () => {
    if (!pool) {
        throw new Error("Database pool has not been initialized.");
    }
    return pool;
};
