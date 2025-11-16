// server/routes/calendar.ts
import express from 'express';
import { pool } from '../db';
const router = express.Router();

// GET /api/calendar
router.get('/', async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT * FROM calendar_events ORDER BY date, id'
    );

    console.log('📌 DB の中身:', r.rows); // ← 追加

    res.json(r.rows);
  } catch (err) {
    console.error('❌ DB エラー:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/calendar
router.post('/', async (req, res) => {
  try {
    const { date, text } = req.body;
    if (!date || !text)
      return res.status(400).json({ message: 'date and text required' });

    const r = await pool.query(
      `INSERT INTO calendar_events (date, text)
       VALUES ($1, $2)
       RETURNING *`,
      [date, text]
    );

    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Create failed' });
  }
});

// PUT /api/calendar/:id
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fields = req.body;
    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;
    for (const key of Object.keys(fields)) {
      setClauses.push(`${key} = $${idx++}`);
      values.push((fields as any)[key]);
    }
    if (setClauses.length === 0)
      return res.status(400).json({ message: 'No fields' });
    values.push(id);
    const q = `UPDATE calendar_events SET ${setClauses.join(
      ', '
    )}, updated_at = now() WHERE id = $${idx} RETURNING *`;
    const r = await pool.query(q, values);
    res.json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Update failed' });
  }
});

// DELETE /api/calendar/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await pool.query('DELETE FROM calendar_events WHERE id = $1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;
