import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/RegisterPage.css";

const CustomButton = ({ children, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

const RegisterPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Пароли не совпадают");
      return;
    }

    try {
      const response = await fetch("http://localhost:5050/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Регистрация прошла успешно");
        navigate("/dashboard"); // Перенаправление на дашборд
      } else {
        alert(result.error || "Ошибка регистрации");
      }
    } catch (error) {
      console.error("Ошибка при регистрации:", error);
      alert("Произошла ошибка при соединении с сервером");
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
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-row">
            <input
              type="password"
              placeholder="Пароль"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              className="input-field"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <CustomButton onClick={handleRegister}>Зарегистрироваться</CustomButton>
          <div className="boxForgotPassword">
            <a href="/forgotpassword" className="forgot-password">
              Забыли пароль?
            </a>
            <a href="/" className="forgot-password">
              Войти в аккаунт
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
