import { getPool } from "../db.js";

export const findMeetingsByUserId = async (userId) => {
    const pool = getPool();
    const { rows } = await pool.query(
        'SELECT id, "meetingCode", date FROM meetings WHERE user_id = $1 ORDER BY date DESC',
        [userId]
    );
    return rows;
};

export const createMeeting = async (userId, meetingCode) => {
    const pool = getPool();
    await pool.query(
        'INSERT INTO meetings (user_id, "meetingCode") VALUES ($1, $2)',
        [userId, meetingCode]
    );
};
