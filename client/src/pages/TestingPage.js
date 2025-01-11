import React, { useEffect, useState } from "react";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";
import "../styles/TestingPage.css";

const TestingPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([
    { id: 1, name: "Тестирование ПТСР", status: "Не пройден", lastDate: null },
    { id: 2, name: "Тестирование ШОВТС", status: "Не пройден", lastDate: null },
  ]);

  const handleTestClick = (id) => {
    navigate(`/tests/${id}`);
    console.log(id, ": id теста")
  };

  useEffect(() => {
    fetch("http://localhost:5050/users/tests", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Данные получены:", data);

        const testStatus = data.testStatus;
        const updatedTests = tests.map((test) => ({
          ...test,
          status: testStatus[test.id]?.status || "Не пройден",
          lastDate: testStatus[test.id]?.last_date || null,
        }));

        setTests(updatedTests);
      })
      .catch((error) => {
        console.error("Ошибка запроса:", error);
      });
  }, []);

  return (
    <div className="testing-container">
      <h2 className="testing-title">Тестирования</h2>
      <div className="test-list">
        {tests.map((test) => (
          <div className="test-card" key={test.id}>
            <div className="test-info">
              <h3 className="test-name">{test.name}</h3>
              <p className="test-status">
                Статус: <span>{test.status}</span>
              </p>
              {test.lastDate && (
                <p className="test-date">
                  Последнее прохождение: {new Date(test.lastDate).toLocaleString()}
                </p>
              )}
            </div>
            <CustomButton onClick={() => handleTestClick(test.id)} className="test-button">
              Перейти к тесту
            </CustomButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestingPage;
