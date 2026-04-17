import { getPool } from "../db.js";

export const findUserByUsername = async (username) => {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return rows[0] || null;
};

export const findUserByToken = async (token) => {
    const pool = getPool();
    const { rows } = await pool.query("SELECT * FROM users WHERE token = $1", [token]);
    return rows[0] || null;
};

export const createUser = async (name, username, hashedPassword) => {
    const pool = getPool();
    const { rows } = await pool.query(
        "INSERT INTO users (name, username, password) VALUES ($1, $2, $3) RETURNING id",
        [name, username, hashedPassword]
    );
    return rows[0].id;
};

export const updateUserToken = async (userId, token) => {
    const pool = getPool();
    await pool.query("UPDATE users SET token = $1 WHERE id = $2", [token, userId]);
};
