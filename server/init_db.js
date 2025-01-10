const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err.message);
    } else {
        console.log('Подключение к базе данных установлено.');
    }
});

function finalizeDatabase() {
    db.close((err) => {
        if (err) {
            console.error("Ошибка закрытия базы данных:", err.message);
        } else {
            console.log("База данных успешно закрыта.");
        }
    });
}
// Очистка таблиц
db.serialize(() => {
    db.run(`ALTER TABLE users ADD COLUMN last_test_date DATETIME`);

});


