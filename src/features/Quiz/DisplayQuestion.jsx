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
  const [quizDetails, setQuizDetails] = useState(null);
  const [localIndex, setLocalIndex] = useState(0);
  const [manualNav, setManualNav] = useState(false);
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
      const details = await quizAPI.getQuizDetails(quizId, token);
      setQuizDetails(details);
      const serverIdx = details?.state?.currentQuestion ?? -1;
      // if user didn't manually navigate, follow server index; otherwise preserve localIndex
      if (!manualNav) {
        const idx = serverIdx >= 0 ? serverIdx : 0;
        setLocalIndex(idx);
        const questionObj = details?.questions?.[idx] || null;
        if (questionObj) setQuestion({ questionId: questionObj.id, text: questionObj.text, options: questionObj.options.map(o => ({ id: o.id, text: o.text })) , timeLimit: questionObj.timeLimit });
        else setQuestion(null);
      } else {
        // update stored details but keep current displayed question
        const questionObj = details?.questions?.[localIndex] || null;
        if (questionObj) setQuestion({ questionId: questionObj.id, text: questionObj.text, options: questionObj.options.map(o => ({ id: o.id, text: o.text })) , timeLimit: questionObj.timeLimit });
      }
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

  const prevQuestion = async () => {
    if (!quizDetails) return;
    const idx = Math.max(0, (localIndex || 0) - 1);
    // clear timer while switching
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setLocalIndex(idx);
    // update displayed question immediately
    const questionObj = quizDetails.questions[idx];
    if (questionObj) setQuestion({ questionId: questionObj.id, text: questionObj.text, options: questionObj.options.map(o => ({ id: o.id, text: o.text })), timeLimit: questionObj.timeLimit });
    // reset selection/state
    setSelectedOption(null);
    setCorrectOption(null);
    setIsRevealed(false);
    setMessage(null);
    setTimeLeft(20);
    // sync server current question so backend and other clients match (mock helper)
    try {
      if (quizAPI.setCurrentQuestion) await quizAPI.setCurrentQuestion(quizId, idx);
    } catch (err) {
      console.warn('setCurrentQuestion failed', err);
    }
    // allow polling to follow server
    setManualNav(false);
  };

  const nextQuestion = async () => {
    if (!quizDetails) return;
    const idx = Math.min(quizDetails.questions.length - 1, (localIndex || 0) + 1);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setLocalIndex(idx);
    const questionObj = quizDetails.questions[idx];
    if (questionObj) setQuestion({ questionId: questionObj.id, text: questionObj.text, options: questionObj.options.map(o => ({ id: o.id, text: o.text })), timeLimit: questionObj.timeLimit });
    setSelectedOption(null);
    setCorrectOption(null);
    setIsRevealed(false);
    setMessage(null);
    setTimeLeft(20);
    try {
      if (quizAPI.setCurrentQuestion) await quizAPI.setCurrentQuestion(quizId, idx);
    } catch (err) {
      console.warn('setCurrentQuestion failed', err);
    }
    setManualNav(false);
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
      // if user navigated manually, tell the mock server to set the current question to localIndex
      if (manualNav && quizAPI.setCurrentQuestion) {
        await quizAPI.setCurrentQuestion(quizId, localIndex);
      }
      const optToSubmit = selectedOption || 0;
      const res = await quizAPI.submitAnswer(quizId, optToSubmit, token);
      setMessage(res.correct ? 'Correct!' : 'Wrong');
      setCorrectOption(res.correctOptionId || null);
      // reveal answers but DO NOT auto-advance; wait for user to click Next
      setIsRevealed(true);
      // keep manualNav as-is (so frontend stays on the question the user saw)
      setIsSubmitting(false);
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
            <div className="nav-actions" style={{display:'flex', gap:12, marginBottom:12}}>
              <button className="action-button" onClick={prevQuestion} disabled={!quizDetails || localIndex <= 0}>Previous</button>
              <div style={{flex:1}} />
              <button className="action-button" onClick={nextQuestion} disabled={!quizDetails || localIndex >= (quizDetails?.questions?.length - 1)}>Next</button>
            </div>
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
