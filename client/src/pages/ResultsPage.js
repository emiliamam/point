import React, { useState, useEffect } from "react";
import "../styles/Navigation.css";

const ResultsPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5050/results", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка получения данных");
        }
        return response.json();
      })
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Ошибка загрузки результатов:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Загрузка результатов...</p>;
  }

  if (!results.length) {
    return <p className="pContent" >Вы пока не прошли никакой тест</p>; // Сообщение, если результатов нет
  }

  return (
    <div className="content">
      <h2>Результаты тестирования</h2>
      <table className="results-table">
        <thead>
          <tr>
            <th>№</th>
            <th>Тест</th>
            <th>Результат</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={result.id}>
              <td>{index + 1}</td>
              <td>{result.testName}</td>
              <td>{result.diagnosis}</td>
              <td>{new Date(result.completed_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsPage;
