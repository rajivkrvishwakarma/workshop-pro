const { db } = require('./lib/db/index.ts');
async function run() {
  const statuses = await db.query.statuses.findMany();
  console.log(statuses);
  process.exit(0);
}
run();
