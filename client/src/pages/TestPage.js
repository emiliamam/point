import React from "react";
import "../styles/TestPage.css"; // Подключаем стили

// Кастовая кнопка
const CustomButton = ({ children, onClick }) => {
  return (
    <button className="custom-button" onClick={onClick}>
      {children}
    </button>
  );
};

// Навигационная панель
const Navigation = () => {
  return (
    <div className="navigation">
      <ul>
        <li className="nav-item active">Личный кабинет</li>
        <li className="nav-item">Тестирование</li>
        <li className="nav-item">Результаты тестирования</li>
        <li className="nav-item">Обратная связь</li>
      </ul>
    </div>
  );
};

// Страница тестирования
const TestingPage = () => {
  const tests = [
    { id: 1, name: "Тестирование ПТСР", status: "Не пройден" },
    { id: 2, name: "Тестирование ШОВТС", status: "Не пройден" },
  ];

  return (
    <div className="testing-page">
      <h2>Тестирования</h2>
      <div className="test-table">
        {tests.map((test) => (
          <div className="test-row" key={test.id}>
            <div className="test-number">{test.id}</div>
            <div className="test-name">{test.name}</div>
            <div className="test-status">{test.status}</div>
            <CustomButton>перейти к тесту</CustomButton>
          </div>
        ))}
      </div>
    </div>
  );
};

// Главная страница пользователя
const UserDashboard = () => {
  return (
    <div className="dashboard">
      <Navigation />
      <TestingPage />
    </div>
  );
};

export default UserDashboard;
