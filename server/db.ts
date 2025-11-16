// ======================================================
// 🌟 FakeDB（StackBlitz） + NeonDB（本番）自動切り替え
// ======================================================

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const isProduction = !!process.env.DATABASE_URL;

let pool: any;

// ======================================================
// 🧪 FakeDB（StackBlitz）
// ======================================================
if (!isProduction) {
  console.log("🧪 Using Fake In-Memory DB (StackBlitz Mode)");

  let memCalendar: any[] = [];
  let memKanban: any[] = [];

  function parseUpdate(sql: string, params: any[]) {
    const setMatch = sql.match(/SET([\s\S]*?)WHERE/i);
    if (!setMatch) return {};
    const setPart = setMatch[1].trim();
    const keyValueParts = setPart.split(",").map((s) => s.trim());
    const result: any = {};
    keyValueParts.forEach((part, i) => {
      const [key] = part.split("=").map((s) => s.trim());
      result[key] = params[i];
    });
    return result;
  }

  pool = {
    async query(sql: string, params: any[] = []) {
      sql = sql.trim();

      // --- Calendar ---
      if (sql.startsWith("SELECT") && sql.includes("calendar_events")) {
        return { rows: memCalendar, rowCount: memCalendar.length };
      }

      if (sql.startsWith("INSERT INTO calendar_events")) {
        const item = {
          id: memCalendar.length + 1,
          date: params[0],
          text: params[1],
          created_at: new Date(),
          updated_at: new Date(),
        };
        memCalendar.push(item);
        return { rows: [item], rowCount: 1 };
      }

      if (sql.startsWith("DELETE FROM calendar_events")) {
        const id = params[0];
        const before = memCalendar.length;
        memCalendar = memCalendar.filter((e) => e.id !== id);
        return { rows: [], rowCount: before - memCalendar.length };
      }

      // --- Kanban ---
      if (sql.startsWith("SELECT") && sql.includes("kanban_cards")) {
        return { rows: memKanban, rowCount: memKanban.length };
      }

      if (sql.startsWith("INSERT INTO kanban_cards")) {
        const item = {
          id: memKanban.length + 1,
          title: params[0],
          description: params[1],
          status: params[2],
          dateStart: params[3],
          dateEnd: params[4],
          checklist: JSON.parse(params[5] || "[]"),
          created_at: new Date(),
          updated_at: new Date(),
        };
        memKanban.push(item);
        return { rows: [item], rowCount: 1 };
      }

      if (sql.startsWith("UPDATE kanban_cards")) {
        const id = params[params.length - 1];
        const item = memKanban.find((t) => t.id === id);
        if (!item) return { rows: [], rowCount: 0 };

        const fields = parseUpdate(sql, params);

        if ("checklist" in fields && typeof fields.checklist === "string") {
          fields.checklist = JSON.parse(fields.checklist);
        }

        if ("date_start" in fields) {
          fields.dateStart = fields.date_start;
          delete fields.date_start;
        }

        if ("date_end" in fields) {
          fields.dateEnd = fields.date_end;
          delete fields.date_end;
        }

        Object.assign(item, fields);
        item.updated_at = new Date();
        return { rows: [item], rowCount: 1 };
      }

      if (sql.startsWith("DELETE FROM kanban_cards")) {
        const id = params[0];
        const before = memKanban.length;
        memKanban = memKanban.filter((t) => t.id !== id);
        return { rows: [], rowCount: before - memKanban.length };
      }

      return { rows: [], rowCount: 0 };
    },
  };
}

// ======================================================
// 🌍 本番（NeonDB）
// ======================================================
else {
  console.log("🌐 Using NeonDB (Production Mode)");

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
}

export { pool };
