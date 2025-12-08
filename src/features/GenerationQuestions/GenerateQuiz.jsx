import React, { useState } from "react";
import "./GenerateQuiz.css";

function GenerateQuiz() {
  const [valueTexte, setValueTexte] = useState("");
  const [valueNumber, setValueNumber] = useState("");

  const handleChangeTexte = (e) => {
    setValueTexte(e.target.value);
  };

  const handleChangeNumber = (e) => {
    setValueNumber(e.target.value);
  };

  return (
    <div className="main">
        <h1>Génération de quiz</h1>
        <div className="input_theme">
            <div>
                <h2>Thème</h2>
            </div>
            <div>
                <input type="text" value={valueTexte} placeholder="Thème du quiz" onChange={handleChangeTexte}/>
            </div>
        </div>

        <div className="input_number_question">
          <input type="number" value={valueNumber} placeholder="Nombre de questions" onChange={handleChangeNumber}
          />
        </div>
      

      <button onClick={() =>console.log("Appel API avec :",valueTexte,valueNumber)}>Générer</button>
   </div>
  );
}

export default GenerateQuiz;
