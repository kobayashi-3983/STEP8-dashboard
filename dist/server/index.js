"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const kanban_1 = __importDefault(require("./routes/kanban"));
const calendar_1 = __importDefault(require("./routes/calendar"));
const weather_1 = __importDefault(require("./routes/weather"));
const db_1 = require("./db");
const weather_2 = __importDefault(require("./routes/weather"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/kanban', kanban_1.default);
app.use('/api/calendar', calendar_1.default);
app.use('/api/weather', weather_1.default);
app.use('/api/weather', weather_2.default);
app.use('/', express_1.default.static('dist/public'));
// health
app.get('/health', async (req, res) => {
    try {
        await db_1.pool.query('SELECT 1');
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: String(err) });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
