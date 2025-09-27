require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function main() {
  try {
    const email = 'admin@example.com';
    const name = 'Admin';
    const password = 'Admin123!';
    const now = new Date(); // for createdAt and updatedAt

    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if admin exists
    const res = await pool.query('SELECT * FROM "Users" WHERE email = $1', [email]);
    if (res.rows.length > 0) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Insert admin with timestamps
    await pool.query(
      'INSERT INTO "Users" (full_name, email, password_hash, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5)',
      [name, email, hashedPassword, now, now]
    );

    console.log(`✅ Admin created! Email: ${email}, Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
