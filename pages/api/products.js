import { getDB } from "../../lib/db";

export default async function handler(req, res) {
  try {
    const db = await getDB();

    if (req.method === "GET") {
      const [rows] = await db.execute(
        "SELECT id, name, quantity, price, description, created_at FROM products ORDER BY id ASC"
      );
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { name, quantity = 0, price = 0, description = "" } = req.body;

      await db.execute(
        "INSERT INTO products (name, quantity, price, description, created_at) VALUES (?,?,?,?,NOW())",
        [name, quantity, price, description]
      );

      return res.status(201).json({ message: "Produk ditambahkan" });
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ message: "id wajib" });

      await db.execute("DELETE FROM products WHERE id=?", [id]);
      return res.status(200).json({ message: "Produk dihapus" });
    }

    return res.status(405).json({ message: "Method not allowed" });
  } catch (e) {
    console.error("API PRODUCTS ERROR:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
