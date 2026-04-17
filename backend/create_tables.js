import mysql from 'mysql2/promise';

const run = async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456789',
    database: 'csb'
  });

  await conn.query(`CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    token VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );`);

  await conn.query(`CREATE TABLE IF NOT EXISTS meetings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    meetingCode VARCHAR(255) NOT NULL,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );`);

  console.log('Tables created.');
  await conn.end();
};

run().catch(err => {
  console.error(err);
  process.exit(1);
});
