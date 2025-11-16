import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// 本番では Vercel の環境変数を使う
const API_KEY = process.env.OPENWEATHER_API_KEY;

router.get("/", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ message: "lat & lon required" });
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=ja&appid=${API_KEY}`;

    // ⭐ Node18 以降は fetch が標準 → import 不要
    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error("WEATHER API ERROR:", err);
    res.status(500).json({ message: "weather fetch failed" });
  }
});

export default router;
