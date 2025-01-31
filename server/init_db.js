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
db.serialize(() => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS calls_schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Уникальный идентификатор
            user_id INTEGER NOT NULL,             -- ID пользователя
            preferred_days TEXT,                  -- Удобные дни недели (JSON-строка)
            specific_date TEXT,                   -- Конкретная дата звонка (в формате ISO)
            time_start TEXT,                      -- Время начала (например, '20:00')
            time_end TEXT,                        -- Время окончания (например, '21:00')
            any_day INTEGER DEFAULT 0,           -- Флаг "В любой день" (0 - false, 1 - true)
            created_at TEXT DEFAULT CURRENT_TIMESTAMP, -- Время создания записи
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP  -- Время последнего обновления записи
        );
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error("Ошибка создания таблицы:", err.message);
        } else {
            console.log("Таблица calls_schedule успешно создана или уже существует.");
        }
    });

    finalizeDatabase();
});

