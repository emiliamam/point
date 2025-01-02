import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const TestPage = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Загрузка вопросов
    axios.get(`http://localhost:5050/tests/${id}/questions`).then((response) => {
      setQuestions(response.data);
    });
  }, [id]);

  const handleAnswer = (answer) => {
    setAnswers([...answers, { id: answer.id, points: answer.points }]);

    const nextIndex = currentIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentIndex(nextIndex);
      setProgress(((nextIndex + 1) / questions.length) * 100);
    } else {
      // Отправляем результаты
      axios
        .post(`http://localhost:5050/tests/${id}/results`, {
          userId: 1,
          answers,
        })
        .then((response) => {
          alert(`Результат: ${response.data.diagnosis}`);
        });
    }
  };

  if (!questions.length) return <p>Загрузка...</p>;

  const currentQuestion = questions[currentIndex];

  return (
    <div>
      <h1>Прогресс: {progress}%</h1>
      <progress value={progress} max="100"></progress>
      <h2>{currentQuestion.text}</h2>
      <ul>
        {currentQuestion.answers.map((answer) => (
          <li key={answer.id}>
            <button onClick={() => handleAnswer(answer)}>{answer.text}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TestPage;
