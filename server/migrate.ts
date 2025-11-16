// 正しい migrate.ts
import { pool } from './db';

(async () => {
  try {
    console.log("Running migration...");

    // connectは不要
    // await pool.connect();

    await pool.query("SELECT 1");

    console.log("Migration complete.");
  } catch (err) {
    console.error(err);
  }
})();
