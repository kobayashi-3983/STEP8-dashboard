import express from 'express';
import { pool } from '../db';

const router = express.Router();

/**
 * GET /api/kanban
 */
router.get('/', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM kanban_cards ORDER BY id');
    console.log('🔥 GET /api/kanban 結果:', r.rows);
    res.json(r.rows);
  } catch (err) {
    console.error('KANBAN GET ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/kanban  ← ★ 修正版（確定）
 */
router.post('/', async (req, res) => {
  console.log('🚨🚨🚨 POST ハンドラ入りました!');

  try {
    console.log('🔥 受信した body:', req.body);

    const { title, description, status, date_start, date_end, checklist } =
      req.body;

    const SQL = `
      INSERT INTO kanban_cards
        (title, description, status, date_start, date_end, checklist)
      VALUES ($1, $2, $3, $4, $5, $6::jsonb)
      RETURNING *;
    `;

    const params = [
      title,
      description || '',
      status || 'not-stated',
      date_start || null,
      date_end || null,
      JSON.stringify(checklist || []), // ← ← ← ここ！！！！
    ];

    console.log('🔥 SQL:', SQL);
    console.log('🔥 PARAMS:', params);

    const r = await pool.query(SQL, params);

    console.log('🔥 INSERT 結果 rows:', r.rows);
    console.log('🔥 INSERT 結果 rowCount:', r.rowCount);

    res.status(201).json(r.rows[0]);
  } catch (err: any) {
    console.error('🔥🔥🔥 CATCH エラー:', err);
    res.status(500).json({
      message: 'Create failed',
      error: err.message,
      detail: err,
    });
  }
});

/**
 * PUT /api/kanban/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    const keys = Object.keys(data);
    if (keys.length === 0) {
      return res.status(400).json({ message: 'No fields provided' });
    }

    const set = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = keys.map((k) => data[k]);

    const query = `
      UPDATE kanban_cards
      SET ${set}, updated_at = now()
      WHERE id = $${keys.length + 1}
      RETURNING *`;

    const r = await pool.query(query, [...values, id]);

    res.json(r.rows[0]);
  } catch (err) {
    console.error('KANBAN UPDATE ERROR:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});

/**
 * DELETE /api/kanban/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    await pool.query('DELETE FROM kanban_cards WHERE id = $1', [id]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('KANBAN DELETE ERROR:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

export default router;
