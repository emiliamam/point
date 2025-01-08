import React from "react";
import CustomButton from "../components/CustomButton";
import { useNavigate } from "react-router-dom";
import "../styles/TestPage.css";

const TestingPage = () => {
  const navigate = useNavigate();

  const tests = [
    { id: 1, name: "Тестирование ПТСР", status: "Не пройден" },
    { id: 2, name: "Тестирование ШОВТС", status: "Не пройден" },
  ];
  const handleTestClick = (id) => {
    navigate(`/tests/${id}`);
  };
  
  return (
    <div className="content">
      <h2>Тестирования</h2>
      <div className="test-table">
        {tests.map((test) => (
          <div className="test-row" key={test.id}>
            <div className="test-number">{test.id}</div>
            <div className="test-name">{test.name}</div>
            <div className="test-status">{test.status}</div>
            <CustomButton onClick={() => handleTestClick(test.id)}> перейти к тесту </CustomButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestingPage;
