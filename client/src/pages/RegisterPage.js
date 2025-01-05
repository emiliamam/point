// RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Для навигации после регистрации
import "../styles/RegisterPage.css"; // Стили для страницы регистрации

// Кастомная кнопка
const CustomButton = ({ children, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState(""); // Хранение имени
  const [email, setEmail] = useState(""); // Хранение email
  const [password, setPassword] = useState(""); // Хранение пароля
  const [confirmPassword, setConfirmPassword] = useState(""); // Хранение подтверждения пароля
  const navigate = useNavigate(); // Хук для навигации

  const handleRegister = () => {
    if (password === confirmPassword) {
      // Логика успешной регистрации (для демонстрации)
      navigate("/dashboard");
    } else {
      alert("Пароли не совпадают");
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <div className="header-box">
          <h1>Зарегистрироваться</h1>
        </div>
        <div className="form-box">
          <div className="form-row">
            <input
              type="text"
              placeholder="ФИО"
              className="input-field"
              value={name}
              onChange={(e) => setName(e.target.value)} // Обработка ввода имени
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)} // Обработка ввода email
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              placeholder="Пароль"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // Обработка ввода пароля
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} // Обработка ввода подтверждения пароля
            />
          </div>
          <CustomButton onClick={handleRegister}>Зарегистрироваться</CustomButton>
          <a href="/login" className="forgot-password">
            Уже есть аккаунт?
          </a>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
