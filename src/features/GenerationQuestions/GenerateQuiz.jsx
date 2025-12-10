import React, { useState } from "react";
import "./GenerateQuiz.css";

function GenerateQuiz() {
  const [valueTexte, setValueTexte] = useState("");
  const [valueNumber, setValueNumber] = useState("");
    // popup
  const [showPopup, setShowPopup] = useState(null); 

    // this useState is here for protect api. If someone spam the button 'generate"
  const [isLoading, setIsLoading] = useState(false); 
    //Popup show for 1.5 sec
  const triggerPopup = (type) => {
    setShowPopup(type);
    setTimeout(() => setShowPopup(null), 1500);
  };
  //security api
  const handleGenerate = async () => {
  if (isLoading) return;

  if (valueTexte.trim() === "" || valueNumber.trim() === "") {
    triggerPopup("empty");
    return;
  }

  setIsLoading(true);

  try {
    const response = await fetch("http://localhost:8080/esigelec-3a2/test/1.0.0/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: valueTexte,
        count: valueNumber,
      }),
    });

    if (!response.ok) {
      throw new Error("error server");
    }

    const data = await response.json();
    console.log("API RESPONSE :", data);

    triggerPopup("ok");
  } catch (err) {
    console.error("API ERROR :", err);
    triggerPopup("error");
  }

  setTimeout(() => setIsLoading(false), 1200);
};

  return (
    <div className="main">

      {showPopup === "empty" && (
        <div className="popup popup-error slide-in">
           <span>Please fill all fields!</span>
        </div>
      )}

      {showPopup === "ok" && (
        <div className="popup popup-ok slide-in">
           <span>Quiz Generated Successfully!</span>
        </div>
      )}
      {showPopup === "error" && (
        <div className="popup popup-error slide-in">
           <span>Error API</span>
        </div>
      )}
      

      <h1>Generate a Quiz</h1>

      <div className="input_theme">
        <h2>Subject</h2>
        <input type="text" value={valueTexte} placeholder="Subject of Quiz" onChange={(e) => setValueTexte(e.target.value)}/>
      </div>

      <div className="input_number_question">
        <h2>Number of Questions</h2>
        <input type="number" value={valueNumber} placeholder="Number of questions" onChange={(e) => setValueNumber(e.target.value)}/>
      </div>

      <button disabled={isLoading} onClick={handleGenerate}>
        {isLoading ? "Loading..." : "Generate"}
      </button>
    </div>
  );
}

export default GenerateQuiz;
