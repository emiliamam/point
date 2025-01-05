import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/Navigation.css";

const Navigation = () => {
  return (
    <div className="navigation">
      <ul>
        <li>
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Личный кабинет
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/testing"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Тестирование
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/results"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Результаты тестирования
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/dashboard/feedback"
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            Обратная связь
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
