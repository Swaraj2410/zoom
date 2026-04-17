import { getPool } from "../db.js";

export const findUserByUsername = async (username) => {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT * FROM users WHERE username = ?", [username]);
    return rows[0] || null;
};

export const findUserByToken = async (token) => {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT * FROM users WHERE token = ?", [token]);
    return rows[0] || null;
};

export const createUser = async (name, username, hashedPassword) => {
    const pool = getPool();
    const [result] = await pool.execute(
        "INSERT INTO users (name, username, password) VALUES (?, ?, ?)",
        [name, username, hashedPassword]
    );
    return result.insertId;
};

export const updateUserToken = async (userId, token) => {
    const pool = getPool();
    await pool.execute("UPDATE users SET token = ? WHERE id = ?", [token, userId]);
};
