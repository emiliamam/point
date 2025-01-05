const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const winston = require("winston");

const app = express();
const PORT = 5050;

app.use(express.json()); 

const logger = winston.createLogger({
    level: "info",
    transports: [
      new winston.transports.Console({ format: winston.format.simple() }), // Логирование в консоль
      new winston.transports.File({ filename: "server.log" }) // Логирование в файл
    ]
  });
  
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

// Маршрут регистрации
app.post("/register", (req, res) => {
    const { email, password, name } = req.body;
  
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Не все поля заполнены" });
    }
  
    // Хэшируем пароль перед сохранением
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Ошибка хэширования пароля", err);
        return res.status(500).json({ error: "Ошибка сервера" });
      }
  
      // Вставляем данные в базу
      db.run(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        [email, hashedPassword, name],
        function (err) {
          if (err) {
            console.error("Ошибка при добавлении пользователя", err);
            return res.status(400).json({ error: "Пользователь с таким email уже существует" });
          }
          res.json({ success: true, id: this.lastID });
        }
      );
    });
  });
  
  // Маршрут логина
  app.post("/login", (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: "Не все поля заполнены" });
    }
  
    // Ищем пользователя в базе данных
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) {
        console.error("Ошибка базы данных:", err.message);
        return res.status(500).json({ error: "Ошибка базы данных" });
      }
  
      if (!user) {
        // Если пользователь не найден
        return res.status(400).json({ error: "Неверный email или пароль" });
      }
  
      // Сравниваем хэш пароля
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Ошибка при проверке пароля", err);
          return res.status(500).json({ error: "Ошибка сервера" });
        }
  
        if (result) {
          // Пароль совпадает
          res.json({ success: true, user });
        } else {
          // Пароль не совпадает
          res.status(400).json({ error: "Неверный email или пароль" });
        }
      });
    });
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
  