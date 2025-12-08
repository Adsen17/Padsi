import { getDB } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    const db = await getDB();

    // ambil transaksi terakhir 50 data
    const [rows] = await db.execute(`
      SELECT 
        s.id,
        s.ref,
        s.total,
        s.created_at,
        COUNT(si.id) AS itemsCount,
        SUM(si.qty) AS totalQty
      FROM sales s
      LEFT JOIN sales_items si ON si.sale_id = s.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT 50
    `);

    res.status(200).json(rows);
  } catch (e) {
    console.error("REPORT ERROR:", e);
    res.status(500).json({ message: e.message });
  }
}
