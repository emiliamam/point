import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles/TestPage.css";

const TestPage = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    axios
      .get(`http://localhost:5050/tests/${id}/questions`)
      .then((response) => {
        setQuestions(response.data);
        console.log("Ответ API:", response.data);
        console.log("Количество вопросов из API:", response.data.length);
      })
      .catch((error) => console.error("Ошибка загрузки вопросов:", error));
  }, [id]);

  const handleAnswer = (answer) => {
    setAnswers([...answers, { id: answer.id, points: answer.points }]);
    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setProgress(((nextIndex) / questions.length) * 100);
      console.log(questions.length)
    } else {
      axios
        .post(`http://localhost:5050/tests/${id}/results`, {
          userId: 1,
          answers,
        })
        .then((response) => alert(`Результат: ${response.data.diagnosis}`));
    }
  };

  if (!questions.length) return <p>Загрузка...</p>;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="test-page">
      <div className="test-container">
        <div className="header-box">
          <h1>Прогресс: {progress.toFixed(0)}%</h1>
        </div>
        <div className="content-box">
          <div className="progress-bar">
            <progress value={progress} max="100"></progress>
          </div>
          <h2>{currentQuestion.text}</h2>
          <ul className="answer-list">
            {currentQuestion.answers.map((answer) => (
              <li key={answer.id}>
                <button
                  className="custom-button"
                  onClick={() => handleAnswer(answer)}
                >
                  {answer.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
