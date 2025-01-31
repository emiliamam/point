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
      new winston.transports.Console({ format: winston.format.simple() }), 
      new winston.transports.File({ filename: "server.log" }) 
    ]
  });

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Сервер работает!");
});

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
  
      req.user = user; 
      next();
    });
  };
  
  const updateTestStatus = (userId, testId, status) => {
    db.get('SELECT test_status FROM users WHERE id = ?', [userId], (err, row) => {
      if (err) {
        console.error(err.message);
        return;
      }
  
      let testStatus = row.test_status ? JSON.parse(row.test_status) : {};
  
      testStatus[testId] = {
        status,
        last_date: new Date().toISOString(),
      };
  
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

app.post("/register", (req, res) => {
    const { email, password, name } = req.body;
    const initialTestStatus = JSON.stringify({
        1: { status: "Не пройден", last_date: null },
        2: { status: "Не пройден", last_date: null },
    });

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Не все поля заполнены" });
    }
  
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error("Ошибка хэширования пароля", err);
        return res.status(500).json({ error: "Ошибка сервера" });
      }
  
      db.run(
        "INSERT INTO users (email, password, name, test_status) VALUES (?, ?, ?, ?)",
        [email, hashedPassword, name, initialTestStatus],
        function (err) {
          if (err) {
            console.error("Ошибка при добавлении пользователя", err);
            return res.status(400).json({ error: "Пользователь с таким email уже существует" });
          }
          const userId = this.lastID; 
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
  
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
      if (err) {
        console.error("Ошибка базы данных:", err.message);
        return res.status(500).json({ error: "Ошибка базы данных" });
      }
  
      if (!user) {
        return res.status(400).json({ error: "Неверный email или пароль" });
      }
  
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          console.error("Ошибка при проверке пароля", err);
          return res.status(500).json({ error: "Ошибка сервера" });
        }
  
        if (result) {
          const token = jwt.sign({ id: user.id, name: user.name }, "SECRET_KEY", { expiresIn: "1h" });

            res.json({ token });
        } else {
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
    const userId = req.user.id;
    const testId = req.params.id;
    const { answers, preferredSchedule } = req.body;
  
    if (!answers || !testId) {
      return res.status(400).json({ error: "Отсутствуют обязательные данные" });
    }
  
    const totalScore = answers.reduce((acc, answer) => acc + answer.points, 0);
  
    let diagnosis = "";
    if (totalScore <= 4) diagnosis = "Нет проблем (0-4%)";
    else if (totalScore <= 26) diagnosis = "Легкие проблемы (5-24%)";
    else if (totalScore <= 54) diagnosis = "Умеренные проблемы (25-49%)";
    else if (totalScore <= 105) diagnosis = "Тяжелые проблемы (50-95%)";
    else diagnosis = "Абсолютные проблемы (96-100%)";
  
    const completedAt = new Date().toISOString();
  
    db.run(
      "INSERT INTO results (user_id, test_id, total_score, diagnosis, completed_at) VALUES (?, ?, ?, ?, ?)",
      [userId, testId, totalScore, diagnosis, completedAt],
      function (err) {
        if (err) {
          console.error("Ошибка сохранения результата:", err.message);
          return res.status(500).json({ error: "Ошибка сохранения результата" });
        }
  
       
        db.get("SELECT test_status FROM users WHERE id = ?", [userId], (err, row) => {
          if (err) {
            console.error("Ошибка получения статуса тестов:", err.message);
            return res.status(500).json({ error: "Ошибка обновления статуса теста" });
          }
  
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
              res.json({ success: true, totalScore, diagnosis });
            }
          );
          
        });
        console.log("Результат успешно сохранен:", { userId, testId, totalScore, diagnosis, completedAt });

      }
    );
  });
  

app.get("/results", authenticateToken, (req, res) => {
    const userId = req.user.id; 
  
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
    const userId = req.user.id; 

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
    const userId = req.user.id; 
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
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error("Ошибка хэширования пароля:", err.message);
                return res.status(500).json({ error: "Ошибка обработки пароля" });
            }
            updateUser(hashedPassword);
        });
    } else {
        updateUser();
    }
});


app.get('/users/tests', authenticateToken, (req, res) => {
    const userId = req.user.id; 

    db.get('SELECT test_status FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        const testStatus = row.test_status ? JSON.parse(row.test_status) : {};
        res.json({ testStatus });
    });
});

app.get('/users/slots', authenticateToken, (req, res) => {
  const userId = req.user.id; 

  const query = `
    SELECT 
      id, 
      preferred_days, 
      specific_date, 
      time_start, 
      time_end, 
      any_day, 
      created_at, 
      updated_at
    FROM calls_schedule
    WHERE user_id = ?
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: 'Ошибка при получении слотов' });
      return;
    }

    const slots = rows.map((row) => ({
      ...row,
      preferred_days: row.preferred_days ? JSON.parse(row.preferred_days) : null,
    }));
    console.log(slots + "   slots")
    res.json({ slots });
  });
});


app.post('/users/slots', authenticateToken, (req, res) => {
  const userId = req.user.id; 
  const { preferred_days, specific_date, time_start, time_end, any_day } = req.body;

  const query = `
    INSERT INTO calls_schedule (user_id, preferred_days, specific_date, time_start, time_end, any_day, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, DATETIME('now'), DATETIME('now'))
  `;

  const params = [
    userId,
    preferred_days ? JSON.stringify(preferred_days) : null,
    specific_date || null,
    time_start,
    time_end,
    any_day,
  ];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: 'Ошибка при добавлении слота' });
      return;
    }

    res.status(201).json({
      id: this.lastID, 
      user_id: userId,
      preferred_days,
      specific_date,
      time_start,
      time_end,
      any_day,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  });
});


app.delete("/users/slots/:id", authenticateToken, (req, res) => {
  const userId = req.user.id; 
  const slotId = req.params.id;
  console.log("slotId "+ slotId)
  console.log("userid "+ userId)
  const query = `
    DELETE FROM calls_schedule
    WHERE id = ? AND user_id = ?
  `;

  db.run(query, [slotId, userId], function (err) {
    if (err) {
      res.status(500).json({ error: "Ошибка при удалении слота" });
      return;
    }

    if (this.changes === 0) {
      res.status(403).json({ error: "Слот не найден или не принадлежит текущему пользователю" });
      return;
    }

    res.status(200).json({ message: "Слот успешно удалён" });
  });
});

app.put("/users/slots/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const slotId = req.params.id; 
  const { preferred_days, specific_date, time_start, time_end, any_day } = req.body;

  const query = `
    UPDATE calls_schedule
    SET preferred_days = ?, specific_date = ?, time_start = ?, time_end = ?, any_day = ?, updated_at = DATETIME('now')
    WHERE id = ? AND user_id = ?
  `;
  const params = [
    preferred_days ? JSON.stringify(preferred_days) : null,
    specific_date || null,
    time_start,
    time_end,
    any_day,
    slotId,
    userId,
  ];

  db.run(query, params, function (err) {
    if (err) {
      res.status(500).json({ error: "Ошибка при обновлении слота" });
      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Слот не найден или не принадлежит текущему пользователю" });
      return;
    }

    res.status(200).json({
      message: "Слот успешно обновлён",
      id: slotId,
      user_id: userId,
      preferred_days,
      specific_date,
      time_start,
      time_end,
      any_day,
    });
  });
});
