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
import { useEffect } from "react";


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("authToken");
    setIsAuthenticated(false);
  };

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
              <div className="dashboard">
                <Navigation logout={logout} />
                <div className="page-content">
                  <Routes>
                    <Route path="" element={<DashboardPage />} />
                    <Route path="testing" element={<TestingPage />} />
                    <Route path="results" element={<ResultsPage />} />
                    <Route path="feedback" element={<FeedbackPage />} />
                    <Route path="/tests" element={<TestingPage />} />
                    <Route path="/tests/:id" element={<TestPage />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
        <Route path="/tests" element={<TestingPage />} />
        <Route path="/tests/:id" element={<TestPage />} />
      </Routes>
    </Router>
  );
}

export default App;
