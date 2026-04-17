import { getPool } from "../db.js";

export const findMeetingsByUserId = async (userId) => {
    const pool = getPool();
    const [rows] = await pool.execute("SELECT id, meetingCode, date FROM meetings WHERE user_id = ? ORDER BY date DESC", [userId]);
    return rows;
};

export const createMeeting = async (userId, meetingCode) => {
    const pool = getPool();
    await pool.execute(
        "INSERT INTO meetings (user_id, meetingCode) VALUES (?, ?)",
        [userId, meetingCode]
    );
};
