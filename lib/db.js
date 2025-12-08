import mysql from "mysql2/promise";

let pool;

export async function getDB() {
  if (pool) return pool;

  const host = process.env.DB_HOST || "localhost";
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "myapp";
  const port = Number(process.env.DB_PORT || 3306);

  console.log("DB CONFIG:", { host, user, database, port });

  pool = mysql.createPool({
    host,
    user,
    password,
    database,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return pool;
}
