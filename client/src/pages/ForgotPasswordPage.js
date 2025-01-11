import React from "react";
import "../styles/RegisterPage.css"; 

const CustomButton = ({ children, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

const ForgotPasswordPage = () => {
  return (
    <div className="registration-page">
      <div className="registration-container">
        <div className="header-box">
          <h1>Восстановление пароля</h1>
        </div>
        <div className="form-box">
          <div className="form-row">
            <input type="email" placeholder="Email" className="input-field" />
          </div>
          <CustomButton>Выслать код</CustomButton>
          <a href="/" className="forgot-password">
            Войти в аккаунт
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
