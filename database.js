const database = require("better-sqlite3");
const db = new database("documents.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        pages INTEGER NOT NULL,
        text TEXT NOT NULL,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log("Database initialized success");
module.exports = db;
