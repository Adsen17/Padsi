import { getDB } from "../../../lib/db";

export default async function handler(req, res) {
  try {
    const db = await getDB();

    // Penjualan = barang keluar (OUT) per hari
    const [rows] = await db.execute(`
      SELECT 
        DATE(l.created_at) AS date,
        SUM(l.qty) AS totalOut,
        SUM(l.qty * p.price) AS totalValue
      FROM stock_logs l
      JOIN products p ON p.id = l.product_id
      WHERE l.type = 'OUT'
      GROUP BY DATE(l.created_at)
      ORDER BY DATE(l.created_at) DESC
      LIMIT 30
    `);

    return res.status(200).json(rows);
  } catch (e) {
    console.error("REPORT SALES ERROR:", e);
    return res.status(500).json({ message: e.message });
  }
}
