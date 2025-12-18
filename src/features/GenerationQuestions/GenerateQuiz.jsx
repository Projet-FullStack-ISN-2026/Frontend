import React, { useContext, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import "./GenerateQuiz.css";
import showAlert from "../../pop_up";
import { API_BASE_URL } from "../../services/authAPI";
import { AuthContext } from "../../contexts/AuthContext";

function GenerateQuiz() {
  const { quizID } = useParams();
  const { token } = useContext(AuthContext) || {};
  const [valueTexte, setValueTexte] = useState("");
  const navigate = useNavigate();
  const [valueNumber, setValueNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (isLoading) return;

    if (!quizID) {
      showAlert("Aucun quiz sélectionné (ID manquant dans l'URL)");
      return;
    }

    const quizId = Number(quizID);
    if (!Number.isFinite(quizId)) {
      showAlert("ID de quiz invalide");
      return;
    }

    if (!valueTexte.trim() || !valueNumber.trim()) {
      showAlert("Please fill all fields!");
      return;
    }

    setIsLoading(true);

    try {
        //appel api en attente pour recuperer le post
        /*
      const createResponse = await fetch("http://10.3.186.13:8080/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "quiz_nouveau"
        }),
      });

      if (!createResponse.ok) throw new Error("Cannot create empty quiz");

      const emptyQuiz = await createResponse.json();
      const quizId = emptyQuiz.id;
      */
      const generateResponse = await fetch(`${API_BASE_URL}/quiz`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: valueTexte,
          count: Number(valueNumber),
        }),
      });

      if (!generateResponse.ok) throw new Error("LLM generation error");

      const generatedQuiz = await generateResponse.json();


      const finalQuiz = {
        id: quizId,
        title: generatedQuiz.title,
        status: 10,
        questions: generatedQuiz.questions.map((q, qIndex) => ({
          id: qIndex + 1,
          text: q.question,
          question: q.question,
          options: q.options.map((opt, optIndex) => ({
            id: optIndex + 1,
            text: opt.text,
            correct: opt.isCorrect,
            isCorrect: opt.isCorrect,
          })),
        })),
      };

      console.log("===== QUIZ FINAL =====");
      console.log(JSON.stringify(finalQuiz, null, 2));

      sessionStorage.setItem(
        "generatedQuiz",
        JSON.stringify(finalQuiz)
      );
      console.log("sessionStorage",sessionStorage)
      showAlert("Quiz generated successfully!");
      setTimeout(() => setIsLoading(false), 1000);

      navigate(`/ModifyQuiz/${quizId}`);

    } catch (err) {
      console.error("API ERROR :", err);
      showAlert("Error API");
    }

    
  };

  return (
    <div className="main">
      <h1>Générer un Quiz</h1>

      <div className="input_theme">
        <h2>Sujet</h2>
        <input
          type="text"
          value={valueTexte}
          placeholder="Sujet du Quiz"
          onChange={(e) => setValueTexte(e.target.value)}
        />
      </div>

      <div className="input_number_question">
        <h2>Nombre de Questions</h2>
        <input
          type="number"
          value={valueNumber}
          placeholder="Nombre de questions"
          onChange={(e) => setValueNumber(e.target.value)}
        />
      </div>

      <button disabled={isLoading} onClick={handleGenerate}>
        {isLoading ? "Chargement..." : "Générer"}
      </button>
    </div>
  );
}

export default GenerateQuiz;
