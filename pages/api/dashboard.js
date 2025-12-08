import { getDB } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const db = await getDB();

    // total produk
    const [[p]] = await db.execute("SELECT COUNT(*) AS total FROM products");
    const totalProducts = p?.total || 0;

    // total stok
    const [[s]] = await db.execute(
      "SELECT SUM(quantity) AS totalStock FROM products"
    );
    const totalStock = s?.totalStock || 0;

    // total nilai
    const [[v]] = await db.execute(
      "SELECT SUM(price * quantity) AS totalValue FROM products"
    );
    const totalValue = v?.totalValue || 0;

    // chart aktivitas dari stock_logs (kalau ada)
    let chartRows = [];
    try {
      const [logs] = await db.execute(`
        SELECT 
          DATE(created_at) AS date,
          COUNT(*) AS cnt
        FROM stock_logs
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at) ASC
        LIMIT 30
      `);
      chartRows = logs || [];
    } catch {
      chartRows = [];
    }

    // chart top produk berdasarkan stok
    let topRows = [];
    try {
      const [tops] = await db.execute(`
        SELECT 
          name,
          quantity
        FROM products
        ORDER BY quantity DESC
        LIMIT 5
      `);
      topRows = tops || [];
    } catch {
      topRows = [];
    }

    return res.status(200).json({
      totalProducts,
      totalStock,
      totalValue,
      chart: chartRows,
      topProducts: topRows, // <-- tambahan buat chart ke-2
    });
  } catch (e) {
    console.error("API DASHBOARD ERROR:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
