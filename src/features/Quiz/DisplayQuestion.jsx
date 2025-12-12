import React, { useState, useEffect, useContext } from 'react';
import '../../assets/DisplayQuestion.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import quizAPI from '../../services/quizAPI';
import { AuthContext } from '../../contexts/AuthContext';

const DisplayQuestion = () => {
  const { quizId } = useParams();
  const { token } = useContext(AuthContext) || {};
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [correctOption, setCorrectOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = React.useRef(null);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const q = await quizAPI.getCurrentQuestion(quizId, token);
      setQuestion(q);
    } catch (err) {
      console.error('Error loading question', err);
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestion();
    const interval = setInterval(loadQuestion, 2000);
    return () => clearInterval(interval);
  }, [quizId]);

  // Timer per question (20s). When it reaches 0 we auto-reveal answers.
  useEffect(() => {
    // reset on new question
    setTimeLeft(20);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          revealAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [question?.questionId]);

  // Selecting an option locally; submission happens on reveal (button click) or timeout
  const handleOption = (optionId) => {
    if (isSubmitting || isRevealed) return;
    setSelectedOption(optionId);
  };

  const revealAnswers = async () => {
    if (isSubmitting || isRevealed) return;
    try {
      setIsSubmitting(true);
      // stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      const optToSubmit = selectedOption || 0;
      const res = await quizAPI.submitAnswer(quizId, optToSubmit, token);
      setMessage(res.correct ? 'Correct!' : 'Wrong');
      setCorrectOption(res.correctOptionId || null);
      setIsRevealed(true);

      setTimeout(async () => {
        setSelectedOption(null);
        setCorrectOption(null);
        setMessage(null);
        setIsRevealed(false);
        await loadQuestion();
        setTimeLeft(20);
        setIsSubmitting(false);
      }, 1400);
    } catch (err) {
      console.error('reveal/submit error', err);
      setIsSubmitting(false);
    }
  };

  const showLeaderboard = async () => {
    // navigate to ranking route which will fetch and display the leaderboard
    navigate(`/quiz/${quizId}/ranking`);
  };

  return (
    <div className="question-page">
      <main className="question-card">
        {loading && <div>Loading question...</div>}

        {!loading && question && (
          <>
            <h2 className="question-title">{question.text}</h2>
            <div className="timer">Time left: {timeLeft}s</div>
            <div className="options">
              {question.options.map(opt => {
                let cls = 'option';
                if (isRevealed) {
                  if (opt.id === correctOption) cls += ' correct';
                  else cls += ' wrong';
                } else if (opt.id === selectedOption) {
                  cls += ' selected';
                }
                return (
                  <button key={opt.id} className={cls} onClick={() => handleOption(opt.id)} disabled={isSubmitting}>{opt.text}</button>
                );
              })}
            </div>
            <div style={{textAlign: 'center', marginTop: 12}}>{message}</div>
            <div className="bottom-actions">
              <button className="action-button" onClick={revealAnswers}>Show answer</button>
              <button className="action-button" onClick={showLeaderboard}>Show leaderboard</button>
            </div>
          </>
        )}

        {!loading && !question && (
          <div style={{textAlign: 'center'}}>No active question</div>
        )}

        {/* Leaderboard is shown on the separate Ranking page */}
      </main>
    </div>
  );
};

export default DisplayQuestion;
