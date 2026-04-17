import dotenv from "dotenv";
import pkg from "pg";

const { Client } = pkg;

dotenv.config();

const run = async () => {
  const useSsl =
    process.env.DB_SSL === "true" ||
    Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes("render.com"));

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || process.env.MYSQL_HOST,
    port: Number(process.env.DB_PORT || process.env.MYSQL_PORT || 5432),
    user: process.env.DB_USER || process.env.MYSQL_USER,
    password: process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD,
    database: process.env.DB_NAME || process.env.MYSQL_DATABASE,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      token TEXT DEFAULT NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS meetings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      "meetingCode" VARCHAR(255) NOT NULL,
      date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("PostgreSQL tables created.");
  await client.end();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
