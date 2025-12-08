import { getDB } from "../../../lib/db";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const db = await getDB();
    const items = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Body harus array" });
    }

    for (const it of items) {
      const name = (it.name || "").trim();
      const delta = Number(it.delta || 0);
      const price = it.price != null ? Number(it.price) : null;

      if (!name || delta === 0) continue;

      // cek produk existing berdasarkan name
      const [rows] = await db.execute(
        "SELECT id, quantity FROM products WHERE name = ? LIMIT 1",
        [name]
      );

      if (rows.length > 0) {
        // ===== produk sudah ada =====
        const productId = rows[0].id;
        const currentQty = Number(rows[0].quantity || 0);

        let newQty = currentQty + delta;
        if (newQty < 0) newQty = 0;

        await db.execute(
          "UPDATE products SET quantity = ? WHERE id = ?",
          [newQty, productId]
        );

        // optional update price kalau ada di excel
        if (price != null && !Number.isNaN(price)) {
          await db.execute(
            "UPDATE products SET price = ? WHERE id = ?",
            [price, productId]
          );
        }

        // ===== CATAT LOG =====
        const type = delta > 0 ? "IN" : "OUT";
        const qtyAbs = Math.abs(delta);

        await db.execute(
          "INSERT INTO stock_logs (product_id, type, qty, note) VALUES (?,?,?,?)",
          [productId, type, qtyAbs, "Import Excel"]
        );
      } else {
        // ===== produk belum ada -> insert baru =====
        const ref = "PRD-" + nanoid(8).toUpperCase();
        const initialQty = delta > 0 ? delta : 0;

        const [ins] = await db.execute(
          "INSERT INTO products (ref, name, quantity, price, created_at) VALUES (?,?,?,?,NOW())",
          [ref, name, initialQty, price || 0]
        );

        const productId = ins.insertId;

        // ===== CATAT LOG BARU =====
        const type = delta > 0 ? "IN" : "OUT";
        const qtyAbs = Math.abs(delta);

        await db.execute(
          "INSERT INTO stock_logs (product_id, type, qty, note) VALUES (?,?,?,?)",
          [productId, type, qtyAbs, "Import Excel (new product)"]
        );
      }
    }

    return res.status(200).json({ message: "Import Excel berhasil" });
  } catch (e) {
    console.error("IMPORT ERROR:", e);
    return res.status(500).json({ message: e.message });
  }
}
