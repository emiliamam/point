import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Для навигации после успешного логина
import "../styles/LoginPage.css"; // Стили для страницы логина

const CustomButton = ({ children, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

const LoginPage = ({setIsAuthenticated}) => {
  const [email, setEmail] = useState(""); // Хранение email
  const [password, setPassword] = useState(""); // Хранение пароля
  const navigate = useNavigate(); // Хук для навигации
  const handleLogin = async () => {
    try {
        const response = await fetch("http://localhost:5050/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });

        const result = await response.json();
        console.log("Ответ от сервера:", result);

        if (response.ok) {
            if (result.token) {
                localStorage.setItem("authToken", result.token);
                console.log("Токен успешно сохранен:", result.token);

                setIsAuthenticated(true);
                navigate("/dashboard");
            } else {
                console.error("Токен отсутствует в ответе сервера");
                alert("Ошибка: Токен отсутствует");
            }
        } else {
            console.log("Ошибка авторизации. Статус:", response.status);
            alert(result.error || "Ошибка входа");
        }
    } catch (error) {
        console.error("Ошибка при попытке входа:", error);
        alert("Произошла ошибка при соединении с сервером");
    }
};

  

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="header-box">
          <h1>Войти в личный кабинет</h1>
        </div>
        <div className="form-box">
          <input
            type="email"
            placeholder="Email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Обработка ввода email
          />
          <input
            type="password"
            placeholder="Пароль"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Обработка ввода пароля
          />
          <CustomButton onClick={handleLogin}>Войти</CustomButton>
          <div className="boxForgotPassword">
            <a href="/forgotpassword" className="forgot-password">
              Забыли пароль?
            </a>
            <a href="/register" className="forgot-password">
              Зарегистрироваться
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
