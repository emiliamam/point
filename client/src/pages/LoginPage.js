// LoginPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Для навигации после успешного логина
import "../styles/LoginPage.css"; // Стили для страницы логина

// Кастомная кнопка
const CustomButton = ({ children, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState(""); // Хранение email
  const [password, setPassword] = useState(""); // Хранение пароля
  const navigate = useNavigate(); // Хук для навигации

  const handleLogin = () => {
    // Простая логика для демонстрации
    if (email === "test@example.com" && password === "password") {
      // Если логин успешный, перенаправляем на главную страницу
      navigate("/dashboard");
    } else {
      alert("Неверный email или пароль");
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
          <a href="/forgotpassword" className="forgot-password">
            Забыли пароль?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
