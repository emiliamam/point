import React, { useState, useEffect } from "react";
import "../styles/TestPage.css";

const ConsultPage = () => {
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState(null);
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [testStatus, setTestStatus] = useState(null); 
  const [accessAllowed, setAccessAllowed] = useState(false); 
  const [formError, setFormError] = useState(""); 

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
        const testResults = data?.testStatus || {};
        setTestStatus(testResults);

        const completedTests = Object.values(testResults).filter(
          (test) => test.status === "Пройден"
        ).length;

        setAccessAllowed(completedTests === 2);
      })
      .catch((error) => {
        console.error("Ошибка проверки тестов:", error.message);
      });
  }, []);

  useEffect(() => {
    fetch("http://localhost:5050/users/slots", {
      headers: {
        "Content-Type": "application/json",
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
  
        const formattedSlots = data.slots.map((slot) => ({
          id: slot.id,
          scheduleMode: slot.any_day ? "anyDay" : slot.preferred_days ? "weekDays" : "specificDay",
          days: slot.preferred_days || [],
          specificDate: slot.specific_date || "",
          timeInterval: {
            start: slot.time_start,
            end: slot.time_end,
          },
        }));
  
        setSlots(formattedSlots);
  
        console.log("Выведи слоты:");
        console.log(formattedSlots);
      })
      .catch((error) => {
        console.error("Ошибка запроса:", error);
        setError(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  

  const handleInputChange = (field, value) => {
    setNewSlot((prev) => ({ ...prev, [field]: value }));
  };

  const toggleDaySelection = (day) => {
    setNewSlot((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day],
    }));
  };

  const handleTimeChange = (type, value) => {
    setNewSlot((prev) => ({
      ...prev,
      timeInterval: {
        ...prev.timeInterval,
        [type]: value,
      },
    }));
  };

  const handleDeleteSlot = async (index) => {
    const slotId = slots[index].id; 
    console.log(slotId);
    console.log(slots)
    try {
      const response = await fetch(`http://localhost:5050/users/slots/${slotId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, 
        },
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
  
      // Удаляем слот из состояния
      setSlots(slots.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Ошибка при удалении слота:", error.message);
    }
  };

  
  const handleSaveSlot = async () => 
  {
    if (newSlot.timeInterval.start >= newSlot.timeInterval.end) {
      setFormError("Время 'С' не может быть позже времени 'До'.");
      return;
    }

    if (newSlot.specificDate && new Date(newSlot.specificDate) < new Date()) {
      setFormError("Дата не может быть в прошлом.");
      return;
    }
    const url = editingSlotIndex !== null 
      ? `http://localhost:5050/users/slots/${slots[editingSlotIndex].id}` 
      : "http://localhost:5050/users/slots"; 
  
    const method = editingSlotIndex !== null ? "PUT" : "POST"; 
    const body = {
      preferred_days: newSlot.days,
      specific_date: newSlot.specificDate,
      time_start: newSlot.timeInterval.start,
      time_end: newSlot.timeInterval.end,
      any_day: newSlot.scheduleMode === "anyDay" ? 1 : 0,
    };
  
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, 
        },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.statusText}`);
      }
  
      const savedSlot = await response.json(); 
  
      if (editingSlotIndex !== null) {
        const updatedSlots = [...slots];
        updatedSlots[editingSlotIndex] = {
          ...savedSlot,
          timeInterval: {
            start: savedSlot.time_start,
            end: savedSlot.time_end,
          },
          days: savedSlot.preferred_days || [],
          specificDate: savedSlot.specific_date || "",
          scheduleMode: savedSlot.any_day ? "anyDay" : savedSlot.preferred_days ? "weekDays" : "specificDay",
        };
        setSlots(updatedSlots);
      } else {
        setSlots([
          ...slots,
          {
            ...savedSlot,
            timeInterval: {
              start: savedSlot.time_start,
              end: savedSlot.time_end,
            },
            days: savedSlot.preferred_days || [],
            specificDate: savedSlot.specific_date || "",
            scheduleMode: savedSlot.any_day ? "anyDay" : savedSlot.preferred_days ? "weekDays" : "specificDay",
          },
        ]);
      }
    } catch (error) {
      console.error("Ошибка при сохранении слота:", error.message);
    } finally {
      setNewSlot(null); 
      setEditingSlotIndex(null); 
      setFormError("");
    }
  };
  

  const handleEditSlot = (index) => {
    setNewSlot(slots[index]);
    setEditingSlotIndex(index);
  };

if (!accessAllowed) {
    return (
      <div className="access-denied">
        <h2>Доступ к консультациям закрыт</h2>
        <p>Вы должны пройти оба теста, чтобы получить доступ к консультациям.</p>
      </div>
    );
  }

  return (
    <div className="content">
        
      <div className="header">
        
            <h1>Консультация</h1>
            <button
                onClick={() => {
                    setNewSlot((prev) =>
                    prev
                        ? null
                        : {
                            scheduleMode: "anyDay",
                            days: [],
                            specificDate: "",
                            timeInterval: { start: "", end: "" },
                        }
                    );
                }}
                className="add-slot-button"
                >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon"
                    width="24"
                    height="24"
                >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                </button>
            </div>

            {formError && <div className="form-error">{formError}</div>}

      {(newSlot || editingSlotIndex !== null) && (
        <div className="form">
          <h2>{editingSlotIndex !== null ? "Редактировать слот" : "Добавить слот"}</h2>

          <div className="schedule-mode">
            <label>
              <input
                type="radio"
                name="scheduleMode"
                value="anyDay"
                checked={newSlot.scheduleMode === "anyDay"}
                onChange={(e) => handleInputChange("scheduleMode", e.target.value)}
              />
              В любой день
            </label>
            <label>
              <input
                type="radio"
                name="scheduleMode"
                value="weekDays"
                checked={newSlot.scheduleMode === "weekDays"}
                onChange={(e) => handleInputChange("scheduleMode", e.target.value)}
              />
              Дни недели
            </label>
            <label>
              <input
                type="radio"
                name="scheduleMode"
                value="specificDay"
                checked={newSlot.scheduleMode === "specificDay"}
                onChange={(e) => handleInputChange("scheduleMode", e.target.value)}
              />
              Конкретный день
            </label>
          </div>

          {newSlot.scheduleMode === "weekDays" && (
            <div className="day-grid">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
                <button
                  key={day}
                  className={`day-button ${newSlot.days.includes(day) ? "selected" : ""}`}
                  onClick={() => toggleDaySelection(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {newSlot.scheduleMode === "specificDay" && (
            <div className="specific-date">
              <label>
                Выберите дату:
                <input
                  type="date"
                  value={newSlot.specificDate}
                  onChange={(e) => handleInputChange("specificDate", e.target.value)}
                />
              </label>
            </div>
          )}

          <div className="time-label">
            <label>
              <span>С:</span>
              <input
                type="time"
                value={newSlot.timeInterval.start}
                step="600"
                onChange={(e) => handleTimeChange("start", e.target.value)}
              />
            </label>
          </div>
          <div className="time-label">
            <label>
              <span>До:</span>
              <input
                type="time"
                value={newSlot.timeInterval.end}
                step="600"
                onChange={(e) => handleTimeChange("end", e.target.value)}
              />
            </label>
          </div>

          <div className="form-buttons">
            <button onClick={handleSaveSlot} className="custom-button">
              Сохранить
            </button>
            <button
              onClick={() => {
                setNewSlot(null);
                setEditingSlotIndex(null);
              }}
              className="custom-button secondary"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="slots-list">
        <h2>Существующие слоты</h2>
        {slots.map((slot, index) => (
          <div key={index} className="slot-item">
            {slot.scheduleMode === "weekDays" && (
              <p>
                <strong>Дни:</strong> {slot.days.join(", ")}
              </p>
            )}
            {slot.scheduleMode === "specificDay" && (
              <p>
                <strong>Дата:</strong> {slot.specificDate}
              </p>
            )}
            <p>
              <strong>Время:</strong> {slot.timeInterval.start} - {slot.timeInterval.end}
            </p>
            <div className="slot-actions">
              <button onClick={() => handleEditSlot(index)} className="custom-button">
                Редактировать
              </button>
              <button onClick={() => handleDeleteSlot(index)} className="custom-button secondary">
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
          
      
    </div>
  );
};

export default ConsultPage;
