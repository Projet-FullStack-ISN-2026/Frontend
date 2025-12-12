import React, { useState } from "react";
import "./GenerateQuiz.css";
import showAlert from "../../pop_up";

function GenerateQuiz() {
  const [valueTexte, setValueTexte] = useState("");
  const [valueNumber, setValueNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (isLoading) return;

    if (!valueTexte.trim() || !valueNumber.trim()) {
      showAlert("Please fill all fields!");
      return;
    }

    setIsLoading(true);
    //http://localhost/3001/quiz
    //http://10.3.70.14:8080/esigelec-3a2/test/1.0.0/quiz
    try {
    const response = await fetch("http://localhost:3001/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: valueTexte,
        count: Number(valueNumber),
      }),
    });


      if (!response.ok) throw new Error("Server error");

      const data = await response.json();

      console.log("===== QUIZ JSON =====");
      console.log(JSON.stringify(data, null, 2)); 

      showAlert("Quiz Generated Successfully!");
    } catch (err) {
      console.error("API ERROR :", err);
      showAlert("Error API");
    }

    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <div className="main">
      <h1>Generate a Quiz</h1>

      <div className="input_theme">
        <h2>Subject</h2>
        <input
          type="text"
          value={valueTexte}
          placeholder="Subject of Quiz"
          onChange={(e) => setValueTexte(e.target.value)}
        />
      </div>

      <div className="input_number_question">
        <h2>Number of Questions</h2>
        <input
          type="number"
          value={valueNumber}
          placeholder="Number of questions"
          onChange={(e) => setValueNumber(e.target.value)}
        />
      </div>

      <button disabled={isLoading} onClick={handleGenerate}>
        {isLoading ? "Loading..." : "Generate"}
      </button>
    </div>
  );
}

export default GenerateQuiz;
