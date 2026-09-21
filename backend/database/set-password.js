/**
 * Set password for a user
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function setPassword() {
  try {
    const email = 'mercy@capwell.co.ke';
    const password = 'Mercy@403'; // Change this to desired password

    console.log(`🔐 Setting password for ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'UPDATE users SET password = $1, password_changed_at = CURRENT_TIMESTAMP WHERE email = $2 RETURNING email, name',
      [hashedPassword, email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`✅ Password set for ${result.rows[0].name} (${result.rows[0].email})`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setPassword();
