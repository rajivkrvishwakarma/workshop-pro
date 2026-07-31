const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_MvIU6qVj9KCH@ep-delicate-wildflower-atf6ys2w.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require' });
pool.query(`select * from "order_items" where "id" = '96cccd9a-8372-4296-97b4-e2b1c60b7967'`)
.then(res => console.log('Rows:', res.rows))
.catch(e => console.error(e))
.finally(() => pool.end());
