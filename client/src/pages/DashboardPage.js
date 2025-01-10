import React, { useState, useEffect } from "react";
import "../styles/TestPage.css";
import "../styles/Navigation.css";
import { useNavigate } from "react-router-dom"; // Для навигации

const DashboardPage = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate(); // Хук для навигации

  console.log(localStorage.getItem("authToken"));

  useEffect(() => {
    // Имитация запроса на сервер для получения текущих данных пользователя
    fetch("http://localhost:5050/user", {
    method: "GET",
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`, // Токен из localStorage
        "Content-Type": "application/json"
    }
})
      .then((response) => response.json())
      .then((data) => setUserData(data))
      .catch((error) => console.error("Ошибка загрузки данных пользователя:", error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Удаляем токен
    navigate("/"); // Перенаправляем на страницу входа
  };


  const handleSaveChanges = () => {
    // Отправка данных на сервер
    fetch("http://localhost:5050/user/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...userData, password: newPassword }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Данные успешно обновлены!");
          setNewPassword("");
        } else {
          alert("Ошибка при обновлении данных");
        }
      })
      .catch((error) => console.error("Ошибка сохранения данных:", error));
  };

  return (
    <div className="content">
      <h2>Личный кабинет</h2>
      <p>Добро пожаловать, {userData.name}!</p>

      <div className="user-info">
        <label>
          Имя:
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleInputChange}
            placeholder="Введите ваше имя"
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleInputChange}
            placeholder="Введите ваш email"
          />
        </label>

        <label>
          Новый пароль:
          <input
            type="password"
            value={newPassword}
            onChange={handlePasswordChange}
            placeholder="Введите новый пароль"
          />
        </label>

        <button className="save-button" onClick={handleSaveChanges}>
          Сохранить изменения
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
