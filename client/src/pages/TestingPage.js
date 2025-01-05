import React from "react";
import CustomButton from "../components/CustomButton";

const TestingPage = () => {
  const tests = [
    { id: 1, name: "Тестирование ПТСР", status: "Не пройден" },
    { id: 2, name: "Тестирование ШОВТС", status: "Не пройден" },
  ];

  return (
    <div className="content">
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

export default TestingPage;
