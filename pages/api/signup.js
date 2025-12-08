import bcrypt from "bcryptjs";
import { getDB } from "../../lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const db = await getDB();
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, dan password wajib diisi" });
    }

    const usernameClean = String(username).trim();
    const emailLower = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLower)) {
      return res.status(400).json({ message: "Format email tidak valid" });
    }

    // cek username sudah dipakai?
    const [u] = await db.execute(
      "SELECT id FROM users WHERE username=? LIMIT 1",
      [usernameClean]
    );
    if (u.length > 0) {
      return res.status(409).json({ message: "Username sudah dipakai" });
    }

    // cek email sudah dipakai?
    const [e] = await db.execute(
      "SELECT id FROM users WHERE email=? LIMIT 1",
      [emailLower]
    );
    if (e.length > 0) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (username, email, password, created_at) VALUES (?,?,?,NOW())",
      [usernameClean, emailLower, hashed]
    );

    return res.status(201).json({
      message: "success",
      id: result.insertId,
    });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
