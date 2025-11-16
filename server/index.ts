// server/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import kanbanRoutes from './routes/kanban';
import calendarRoutes from './routes/calendar';
import weatherRoutes from './routes/weather';
import { db, pool } from './db';
import weatherRouter from './routes/weather';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/kanban', kanbanRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/weather', weatherRouter);

app.use('/', express.static('dist/public'));

// health
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
