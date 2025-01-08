const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./db.sqlite", (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.message);
  } else {
    console.log("Подключение к базе данных SQLite успешно!");
  }
});

const sql = `DELETE FROM answers WHERE id > 22`;

db.run(sql, function (err) {
    if (err) {
        console.error('Ошибка при удалении записей:', err.message);
    } else {
        console.log(`Успешно удалено записей: ${this.changes}`);
    }
});

module.exports = db;
