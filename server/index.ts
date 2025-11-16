import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import kanbanRoutes from './routes/kanban';
import calendarRoutes from './routes/calendar';
import weatherRoutes from './routes/weather';
import { pool } from './db';   // ← pool だけ

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API ルート
app.use('/api/kanban', kanbanRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/weather', weatherRoutes);

// dist/public を静的配信
app.use('/', express.static('dist/public'));

// health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
