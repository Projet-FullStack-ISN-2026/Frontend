import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/PrintQuestion.css'; 
import Timer from '../../layouts/timer';


const PrintQuestion = () => {
    const navigate = useNavigate(); 
    const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
    const [showResults, setShowResults] = useState(false); 
    
    
    const options = ["Option 1", "Option 2", "Option 3", "Option 4"];
    const questionTitle = "Intitulé de la question";
    const correctAnswerIndex = 1; 

    const handleOptionSelect = (index) => {
        if (!showResults) { 
            setSelectedOptionIndex(index);
        }
    };
    
    const handleShowAnswer = () => {
        if (selectedOptionIndex !== null) {
            setShowResults(true); 
        }
    };

    const handleShowLeaderboard = () => {
        navigate('/ranking'); 
    };


    return (
        <div className="question-page">
           

            <main className="question-card">
                
                <h2 className="question-title">{questionTitle}</h2>
                
               
                <div className="timer">
                    <Timer />
                </div>

                <div className="options">
                    {options.map((option, index) => {
                        let dynamicClasses = 'option';
                        
                       
                        if (index === selectedOptionIndex && !showResults) {
                            dynamicClasses += ' option-selected';
                        }
                        
                        
                        if (showResults) {
                            if (index === correctAnswerIndex) {
                                
                                dynamicClasses += ' option-correct';
                            } else if (index === selectedOptionIndex && index !== correctAnswerIndex) {
                                
                                dynamicClasses += ' option-incorrect';
                            }
                        }
                        
                        return (
                            <button 
                                key={index} 
                                className={dynamicClasses}
                                onClick={() => handleOptionSelect(index)}
                                disabled={showResults}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
                
                <div className="bottom-actions">
                    <button 
                        className="action-button"
                        onClick={handleShowAnswer}
                        disabled={showResults || selectedOptionIndex === null} 
                    >
                        Show answer
                    </button>
                    <button 
                        className="action-button"
                        onClick={handleShowLeaderboard}
                    >
                        Show leaderboard
                    </button>
                </div>
            </main>
        </div>
    );
};

export default PrintQuestion;