"use strict";
// ======================================================
// 🌟 完全 StackBlitz 専用 FakeDB（NeonDB 無効化）
// 　 camelCase 完全対応（dateStart/dateEnd OK）
// ======================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
console.log("🧪 ALWAYS Using In-Memory Fake DB (NeonDB disabled)");
let memCalendar = [];
let memKanban = [];
// ------------------------------------------------------
// SET 文を正確にパースして {key: value} を作る
// ------------------------------------------------------
function parseUpdate(sql, params) {
    const setMatch = sql.match(/SET([\s\S]*?)WHERE/i);
    if (!setMatch)
        return {};
    const setPart = setMatch[1].trim();
    const keyValueParts = setPart.split(",").map((s) => s.trim());
    const result = {};
    keyValueParts.forEach((part, index) => {
        const [key] = part.split("=").map((s) => s.trim());
        result[key] = params[index];
    });
    return result;
}
// ------------------------------------------------------
// 🧪 Fake PostgreSQL pool
// ------------------------------------------------------
exports.pool = {
    async query(sql, params = []) {
        sql = sql.trim();
        // ================================
        // 📅 Calendar SELECT
        // ================================
        if (sql.startsWith("SELECT") && sql.includes("calendar_events")) {
            return { rows: memCalendar, rowCount: memCalendar.length };
        }
        // ================================
        // 📅 Calendar INSERT
        // ================================
        if (sql.startsWith("INSERT INTO calendar_events")) {
            const newItem = {
                id: memCalendar.length + 1,
                date: params[0],
                text: params[1],
                created_at: new Date(),
                updated_at: new Date(),
            };
            memCalendar.push(newItem);
            return { rows: [newItem], rowCount: 1 };
        }
        // ================================
        // 📅 Calendar DELETE
        // ================================
        if (sql.startsWith("DELETE FROM calendar_events")) {
            const id = params[0];
            const before = memCalendar.length;
            memCalendar = memCalendar.filter((e) => e.id !== id);
            return { rows: [], rowCount: before - memCalendar.length };
        }
        // ================================
        // 🗂️ Kanban SELECT
        // ================================
        if (sql.startsWith("SELECT") && sql.includes("kanban_cards")) {
            return { rows: memKanban, rowCount: memKanban.length };
        }
        // ================================
        // 🗂️ Kanban INSERT（camelCase 完全対応）
        // ================================
        if (sql.startsWith("INSERT INTO kanban_cards")) {
            const newItem = {
                id: memKanban.length + 1,
                title: params[0],
                description: params[1],
                status: params[2],
                dateStart: params[3], // ← camelCase!!
                dateEnd: params[4], // ← camelCase!!
                checklist: JSON.parse(params[5] || "[]"),
                created_at: new Date(),
                updated_at: new Date(),
            };
            memKanban.push(newItem);
            return { rows: [newItem], rowCount: 1 };
        }
        // ================================
        // 🗂️ Kanban UPDATE（camelCase 自動変換つき）
        // ================================
        if (sql.startsWith("UPDATE kanban_cards")) {
            const id = params[params.length - 1];
            const item = memKanban.find((t) => t.id === id);
            if (!item)
                return { rows: [], rowCount: 0 };
            const fields = parseUpdate(sql, params);
            // checklist は JSON 変換が必要
            if ("checklist" in fields && typeof fields.checklist === "string") {
                try {
                    fields.checklist = JSON.parse(fields.checklist);
                }
                catch { }
            }
            // 🔥 snake_case → camelCase に変換
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
        // ================================
        // 🗂️ Kanban DELETE
        // ================================
        if (sql.startsWith("DELETE FROM kanban_cards")) {
            const id = params[0];
            const before = memKanban.length;
            memKanban = memKanban.filter((t) => t.id !== id);
            return { rows: [], rowCount: before - memKanban.length };
        }
        return { rows: [], rowCount: 0 };
    },
};
