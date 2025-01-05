import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import TestPage from "./pages/TestPage";
import TestingPage from "./pages/TestingPage";
import ResultsPage from "./pages/ResultsPage";
import DashboardPage from "./pages/DashboardPage";
import FeedbackPage from "./pages/FeedbackPage";
import Navigation from "./components/Navigation";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import { useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Состояние авторизации

  // Компонент для защищенного маршрута
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Маршруты для страниц без авторизации */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgotpassword" element={<ForgotPasswordPage />} />

        {/* Защищенные маршруты для дашборда */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <div className="dashboard">
                <Navigation /> {/* Навигация для дашборда */}
                <div className="page-content">
                  <Routes>
                    <Route path="" element={<DashboardPage />} />
                    <Route path="testing" element={<TestingPage />} />
                    <Route path="results" element={<ResultsPage />} />
                    <Route path="feedback" element={<FeedbackPage />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
