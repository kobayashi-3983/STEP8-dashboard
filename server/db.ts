// ======================================================
// 🌟 FakeDB（開発） + NeonDB（本番）自動切り替え
// ======================================================

import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

// ------------------------------------------------------
// 本番を判定
// ------------------------------------------------------
const isProduction = !!process.env.DATABASE_URL;

// トップレベルで export（条件分岐の中で export しない）
// これが Vercel / TypeScript の正解
export const pool: any = isProduction
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : createFakeDB();

// ------------------------------------------------------
// 🧪 FakeDB（StackBlitz / ローカル用）
// ------------------------------------------------------
function createFakeDB() {
  console.log("🧪 Using Fake In-Memory DB (Dev Mode)");

  let memCalendar: any[] = [];
  let memKanban: any[] = [];

  function parseUpdate(sql: string, params: any[]) {
    const setMatch = sql.match(/SET([\s\S]*?)WHERE/i);
    if (!setMatch) return {};
    const parts = setMatch[1].trim().split(",").map((s) => s.trim());
    const map: any = {};
    parts.forEach((p, i) => {
      const [key] = p.split("="); 
      map[key.trim()] = params[i];
    });
    return map;
  }

  return {
    async query(sql: string, params: any[] = []) {
      sql = sql.trim();

      // -------------------------------
      // Calendar SELECT
      // -------------------------------
      if (sql.startsWith("SELECT") && sql.includes("calendar_events")) {
        return { rows: memCalendar, rowCount: memCalendar.length };
      }

      // Calendar INSERT
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

      // Calendar DELETE
      if (sql.startsWith("DELETE FROM calendar_events")) {
        const id = params[0];
        const before = memCalendar.length;
        memCalendar = memCalendar.filter((e) => e.id !== id);
        return { rows: [], rowCount: before - memCalendar.length };
      }

      // -------------------------------
      // Kanban SELECT
      // -------------------------------
      if (sql.startsWith("SELECT") && sql.includes("kanban_cards")) {
        return { rows: memKanban, rowCount: memKanban.length };
      }

      // Kanban INSERT
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

      // Kanban UPDATE
      if (sql.startsWith("UPDATE kanban_cards")) {
        const id = params[params.length - 1];
        const item = memKanban.find((t) => t.id === id);
        if (!item) return { rows: [], rowCount: 0 };

        const fields = parseUpdate(sql, params);

        if ("checklist" in fields && typeof fields.checklist === "string") {
          try {
            fields.checklist = JSON.parse(fields.checklist);
          } catch {}
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

      // Kanban DELETE
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
