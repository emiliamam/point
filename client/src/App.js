import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TestPage from "./pages/TestPage";
import TestingPage from "./pages/TestingPage";
import ResultsPage from "./pages/ResultsPage";
import DashboardPage from "./pages/DashboardPage";
import FeedbackPage from "./pages/FeedbackPage";
import Navigation from "./components/Navigation";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import "./styles/TestPage.css";
import "./styles/Navigation.css";
import "./App.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Проверяем токен при загрузке
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsAuthenticated(!!token);

    // Обновляем состояние при изменении localStorage
    const handleStorageChange = () => {
      const token = localStorage.getItem("authToken");
      setIsAuthenticated(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

  // Компонент для защищенных маршрутов
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard logout={logout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tests/:id"
          element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Page */}
        <Route path="*" element={<div>Страница не найдена</div>} />
      </Routes>
    </Router>
  );
}

// Dashboard Component (структура защищенных маршрутов)
const Dashboard = ({ logout }) => {
  return (
    <div className="dashboard">
      <Navigation logout={logout} />
      <div className="page-content">
        <Routes>
          <Route path="" element={<DashboardPage />} />
          <Route path="testing" element={<TestingPage />} />
          <Route path="results" element={<ResultsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="tests" element={<TestingPage />} />
          {/* <Route path="tests/:id" element={<TestPage />} /> */}
        </Routes>
      </div>
    </div>
  );
};

export default App;
