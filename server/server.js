const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const winston = require("winston");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5050;
const saltRounds = 10;

app.use(express.json()); 
require("dotenv").config();

const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  
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

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    console.log("Заголовок Authorization:", authHeader);
  
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Доступ запрещен. Токен отсутствует." });
    }
  
    jwt.verify(token, "SECRET_KEY", (err, user) => {
      if (err) {
        console.error("Ошибка проверки токена:", err.message);
        return res.status(403).json({ error: "Недействительный токен" });
      }
  
      req.user = user; // Данные пользователя из токена
      next();
    });
  };
  
  const updateTestStatus = (userId, testId, status) => {
    db.get('SELECT test_status FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
  
      // Получить текущий статус тестов
      let testStatus = row.test_status ? JSON.parse(row.test_status) : {};
  
      // Обновить данные для конкретного теста
      testStatus[testId] = {
        status,
        last_date: new Date().toISOString(),
      };
  
      // Сохранить обновленный JSON в базу
      db.run(
        'UPDATE users SET test_status = ? WHERE id = ?',
        [JSON.stringify(testStatus), userId],
        (err) => {
          if (err) {
            console.error(err.message);
          } else {
            console.log('Test status updated successfully');
          }
        }
      );
    });
  };

// Маршрут регистрации
app.post("/register", (req, res) => {
    const { email, password, name } = req.body;
    const initialTestStatus = JSON.stringify({
        1: { status: "Не пройден", last_date: null },
        2: { status: "Не пройден", last_date: null },
    });

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
        "INSERT INTO users (email, password, name, test_status) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, name, initialTestStatus],
        function (err) {
          if (err) {
            console.error("Ошибка при добавлении пользователя", err);
            return res.status(400).json({ error: "Пользователь с таким email уже существует" });
          }
          const userId = this.lastID; // Получаем ID вставленного пользователя
          const token = jwt.sign({ id: userId, name }, "SECRET_KEY", { expiresIn: "1h" });
  
          res.json({ token });
        }
      );
    });
  });
  
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
          const token = jwt.sign({ id: user.id, name: user.name }, "SECRET_KEY", { expiresIn: "1h" });

            res.json({ token });
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
        q.id AS question_id, 
        q.text AS question_text,
        a.id AS answer_id, 
        a.text AS answer_text, 
        a.score
      FROM questions q
      JOIN answers a ON q.id = a.question_id
      WHERE q.test_id = ?
      `,
      [testId],
      (err, rows) => {
        if (err) {
          console.error("Ошибка получения вопросов:", err.message);
          return res.status(500).json({ error: "Ошибка получения вопросов" });
        }
  
        if (!rows.length) {
          return res.status(404).json({ error: "Вопросы не найдены для указанного теста" });
        }
  
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
                  points: row.score,
                },
              ],
            });
          } else {
            question.answers.push({
              id: row.answer_id,
              text: row.answer_text,
              points: row.score,
            });
          }
          return acc;
        }, []);
  
        res.json(questions);
      }
    );
  });
  

  app.post("/tests/:id/results", authenticateToken, (req, res) => {
    const userId = req.user.id; // Получаем ID пользователя из токена
    const testId = req.params.id;
    const { answers } = req.body;
  
    if (!answers || !testId) {
      return res.status(400).json({ error: "Отсутствуют обязательные данные" });
    }
  
    // Рассчитываем общий балл
    const totalScore = answers.reduce((acc, answer) => acc + answer.points, 0);
  
    // Определяем диагноз
    let diagnosis = "";
    if (totalScore <= 4) diagnosis = "Нет проблем (0-4%)";
    else if (totalScore <= 26) diagnosis = "Легкие проблемы (5-24%)";
    else if (totalScore <= 54) diagnosis = "Умеренные проблемы (25-49%)";
    else if (totalScore <= 105) diagnosis = "Тяжелые проблемы (50-95%)";
    else diagnosis = "Абсолютные проблемы (96-100%)";
  
    const completedAt = new Date().toISOString(); // Текущая дата и время
  
    // Сохраняем результат теста в таблицу `results`
    db.run(
      "INSERT INTO results (user_id, test_id, total_score, diagnosis, completed_at) VALUES (?, ?, ?, ?, ?)",
      [userId, testId, totalScore, diagnosis, completedAt],
      function (err) {
        if (err) {
          console.error("Ошибка сохранения результата:", err.message);
          return res.status(500).json({ error: "Ошибка сохранения результата" });
        }
  
        console.log("Результат успешно сохранен:", { userId, testId, totalScore, diagnosis, completedAt });
  
        // После сохранения результата обновляем статус теста
        db.get("SELECT test_status FROM users WHERE id = ?", [userId], (err, row) => {
          if (err) {
            console.error("Ошибка получения статуса тестов:", err.message);
            return res.status(500).json({ error: "Ошибка обновления статуса теста" });
          }
  
          // Обновляем или создаем данные для тестов
          let testStatus = row?.test_status ? JSON.parse(row.test_status) : {};
          testStatus[testId] = {
            status: "Пройден",
            last_date: completedAt,
          };
  
          db.run(
            "UPDATE users SET test_status = ? WHERE id = ?",
            [JSON.stringify(testStatus), userId],
            (err) => {
              if (err) {
                console.error("Ошибка обновления статуса теста:", err.message);
                return res.status(500).json({ error: "Ошибка обновления статуса теста" });
              }
  
              console.log("Статус теста успешно обновлен");
              // Отправляем финальный ответ клиенту
              res.json({ success: true, totalScore, diagnosis });
            }
          );
        });
      }
    );
  });
  

app.get("/results", authenticateToken, (req, res) => {
    const userId = req.user.id; // Получаем ID пользователя из токена
  
    const query = `
      SELECT 
        r.id AS id,
        t.name AS testName,
        r.diagnosis AS diagnosis,
        r.completed_at AS completed_at
      FROM results r
      JOIN tests t ON r.test_id = t.id
      WHERE r.user_id = ?
      ORDER BY r.completed_at DESC
    `;
  
    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error("Ошибка получения результатов:", err.message);
        return res.status(500).json({ error: "Ошибка получения результатов" });
      }
  
      const formattedResults = rows.map((row) => ({
        id: row.id,
        testName: row.testName,
        diagnosis: row.diagnosis,
        completed_at: row.completed_at,
      }));
  
      res.json(formattedResults);
    });
  });

app.get("/user", authenticateToken, (req, res) => {
    const userId = req.user.id; // Получаем ID пользователя из токена

    const query = `
        SELECT name, email
        FROM users
        WHERE id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error("Ошибка получения данных пользователя:", err.message);
            return res.status(500).json({ error: "Ошибка получения данных пользователя" });
        }

        if (!row) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json(row);
    });
});


app.post("/user/update", authenticateToken, (req, res) => {
    const userId = req.user.id; // Получение ID пользователя из токена
    const { name, email, password } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Имя и email обязательны для обновления" });
    }

    const updateUser = (hashedPassword = null) => {
        const query = hashedPassword
            ? `UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?`
            : `UPDATE users SET name = ?, email = ? WHERE id = ?`;

        const params = hashedPassword
            ? [name, email, hashedPassword, userId]
            : [name, email, userId];

        db.run(query, params, function (err) {
            if (err) {
                console.error("Ошибка обновления данных пользователя:", err.message);
                return res.status(500).json({ error: "Ошибка обновления данных пользователя" });
            }

            res.json({ success: true });
        });
    };

    if (password) {
        // Хэшируем пароль, если он передан
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error("Ошибка хэширования пароля:", err.message);
                return res.status(500).json({ error: "Ошибка обработки пароля" });
            }
            updateUser(hashedPassword);
        });
    } else {
        // Если пароль не передан, обновляем только имя и email
        updateUser();
    }
});


app.get('/users/tests', authenticateToken, (req, res) => {
    const userId = req.user.id; // Получаем userId из токена

    db.get('SELECT test_status FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const testStatus = row.test_status ? JSON.parse(row.test_status) : {};
        res.json({ testStatus });
    });
});