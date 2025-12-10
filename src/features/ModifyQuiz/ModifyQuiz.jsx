import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Modify_template.css";

function ModifyQuiz() {
    const { quizID } = useParams();  
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);

   
    const loadQuestions = async () => {
        try {
            const response = await fetch(`http://localhost:8080/esigelec-3a2/test/1.0.0/quiz/${quizID}/questions`);

            if (response.status === 404) {
                alert("Quiz non trouvé.");
                navigate("/Quiz/QuizList");
                return;
            }

            if (!response.ok) throw new Error("Erreur serveur");

            const data = await response.json();
            setQuestions(data);
            console.log("API GET 200", data);

        } catch (err) {
            console.error("Erreur GET", err);
            navigate("/Quiz/QuizList");
        }
    };

    
    const deleteQuestion = async (questionId) => {
        try {
            const response = await fetch(
                `http://localhost:8080/esigelec-3a2/test/1.0.0/quiz/${quizID}/questions/${questionId}`,
                { method: "DELETE" }
            );

            if (response.status === 403) {
                alert("Accès refusé.");
                navigate("/Quiz/QuizList");
                return;
            }

            if (response.status === 404) {
                alert("Question introuvable.");
                navigate("/Quiz/QuizList");
                return;
            }

            if (response.status === 204) {
                alert("Question supprimée !");
                loadQuestions(); 
                return;
            }

        } catch (err) {
            console.error("Erreur DELETE", err);
        }
    };


    const updateQuestion = async (questionId, questionData) => {
        try {
            const response = await fetch(
                `http://localhost:8080/esigelec-3a2/test/1.0.0/questions/${questionId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(questionData),
                }
            );

            if (response.status === 403) {
                alert("Accès refusé.");
                navigate("/Quiz/QuizList");
                return;
            }

            if (response.status === 404) {
                alert("Question introuvable.");
                navigate("/Quiz/QuizList");
                return;
            }

            if (response.status === 200) {
                alert("Question mise à jour !");
                loadQuestions();
            }

        } catch (err) {
            console.error("Erreur PUT", err);
        }
    };

    useEffect(() => {
        loadQuestions();
    }, []);

    return (
        <div className="main">
            <h1>Modifier le Quiz</h1>

            {questions.map(q => (
                <div key={q.id} className="question-block">
                    <h3>{q.title}</h3>

                    <button onClick={() => deleteQuestion(q.id)}>Supprimer</button>

                    <button
                        onClick={() =>
                            updateQuestion(q.id, {
                                question: q.title,
                                options: q.options
                            })
                        }
                    >
                        Mettre à jour
                    </button>
                </div>
            ))}
        </div>
    );
}

export default ModifyQuiz;
