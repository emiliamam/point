const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 5050;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Простейший маршрут
app.get("/", (req, res) => {
  res.send("Сервер работает!");
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});

const db = require("./db");

app.post("/register", (req, res) => {
    const { email, password, name } = req.body;
  
    db.run(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, password, name],
      function (err) {
        if (err) {
          res.status(400).json({ error: "Пользователь с таким email уже существует" });
        } else {
          res.json({ success: true, id: this.lastID });
        }
      }
    );
  });

  app.post("/login", (req, res) => {
    const { email, password } = req.body; // Данные из запроса
  
    db.get(
      "SELECT * FROM users WHERE email = ? AND password = ?",
      [email, password],
      (err, user) => {
        if (err) {
          // Ошибка выполнения запроса
          console.error("Ошибка базы данных:", err.message);
          return res.status(500).json({ error: "Ошибка базы данных" });
        }
  
        if (!user) {
          // Пользователь не найден
          return res.status(400).json({ error: "Неверный email или пароль" });
        }
  
        // Пользователь найден
        res.json({ success: true, user });
      }
    );
  });

app.get("/tests", (req, res) => {
db.all("SELECT * FROM tests", (err, rows) => {
    if (err) {
    res.status(500).json({ error: "Ошибка получения тестов" });
    } else {
    res.json(rows);
    }
});
});

app.get("/tests/:id/questions", (req, res) => {
const testId = req.params.id;
db.all(
    `
    SELECT 
    q.id as question_id, q.question_text,
    a.id as answer_id, a.answer_text, a.points
    FROM questions q
    JOIN answers a ON q.id = a.question_id
    WHERE q.test_id = ?
    `,
    [testId],
    (err, rows) => {
    if (err) {
        res.status(500).json({ error: "Ошибка получения вопросов" });
    } else {
        const questions = rows.reduce((acc, row) => {
        const question = acc.find((q) => q.id === row.question_id);
        if (!question) {
            acc.push({
            id: row.question_id,
            text: row.question_text,
            answers: [
                {
                id: row.answer_id,
                text: row.answer_text,
                points: row.points,
                },
            ],
            });
        } else {
            question.answers.push({
            id: row.answer_id,
            text: row.answer_text,
            points: row.points,
            });
        }
        return acc;
        }, []);
        res.json(questions);
    }
    }
);
});

app.post("/tests/:id/results", (req, res) => {
const { userId, answers } = req.body;
const testId = req.params.id;

const totalScore = answers.reduce((acc, answer) => acc + answer.points, 0);

let diagnosis = "";
if (totalScore <= 4) diagnosis = "Нет проблем (0-4%)";
else if (totalScore <= 26) diagnosis = "Легкие проблемы (5-24%)";
else if (totalScore <= 54) diagnosis = "Умеренные проблемы (25-49%)";
else if (totalScore <= 105) diagnosis = "Тяжелые проблемы (50-95%)";
else diagnosis = "Абсолютные проблемы (96-100%)";

db.run(
    "INSERT INTO results (user_id, test_id, score, diagnosis) VALUES (?, ?, ?, ?)",
    [userId, testId, totalScore, diagnosis],
    function (err) {
    if (err) {
        res.status(500).json({ error: "Ошибка сохранения результата" });
    } else {
        res.json({ success: true, totalScore, diagnosis });
    }
    }
);
});
  