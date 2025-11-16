"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express_1.default.Router();
// .env の API KEY を使用
const API_KEY = process.env.OPENWEATHER_API_KEY;
router.get("/", async (req, res) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ message: "lat & lon required" });
        }
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    }
    catch (err) {
        console.error("WEATHER API ERROR:", err);
        res.status(500).json({ message: "weather fetch failed" });
    }
});
exports.default = router;
