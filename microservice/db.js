const sqlite3 = require("sqlite3");

// feel free to adjust this to your existing sqlite database path
const db = new sqlite3.Database("./app.db");

module.exports = db;