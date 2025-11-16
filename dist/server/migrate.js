"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 正しい migrate.ts
const db_1 = require("./db");
(async () => {
    try {
        console.log("Running migration...");
        // connectは不要
        // await pool.connect();
        await db_1.pool.query("SELECT 1");
        console.log("Migration complete.");
    }
    catch (err) {
        console.error(err);
    }
})();
