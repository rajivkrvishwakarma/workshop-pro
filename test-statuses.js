const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:n89mJqPQsUHz@ep-lively-firefly-a5o3jwwj.us-east-2.aws.neon.tech/workshop-db?sslmode=require' });
async function run() {
  const { rows } = await pool.query('SELECT * FROM statuses');
  console.log(rows);
  process.exit(0);
}
run();
