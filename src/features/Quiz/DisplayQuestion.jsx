import React, { useState, useEffect, useContext } from 'react';
import '../../assets/DisplayQuestion.css';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import quizAPI from '../../services/quizAPI';
import { AuthContext } from '../../contexts/AuthContext';

const DisplayQuestion = () => {
  const { quizId } = useParams();
  const { token, user } = useContext(AuthContext) || {};
  const isAdmin = user?.role === 100;
  const [question, setQuestion] = useState(null);
  const [quizDetails, setQuizDetails] = useState(null);
  const [localIndex, setLocalIndex] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const localIndexRef = React.useRef(localIndex);
  const initializedRef = React.useRef(initialized);
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
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
      // On first load, initialize localIndex from server OR restoreState if present; afterwards keep localIndex
      let displayIdx = localIndexRef.current;
      if (!initializedRef.current) {
        // prefer restoreState from navigation or sessionStorage
        let restore = location?.state && location.state.restoreState ? location.state.restoreState : null;
        if (!restore) {
          try { restore = JSON.parse(sessionStorage.getItem(`quiz_restore_${quizId}`) || 'null'); } catch(e) { restore = null; }
        }
        console.log('DisplayQuestion.loadQuestion - restore read (location/sessionStorage):', restore);
        const idx = restore && typeof restore.index !== 'undefined' ? Number(restore.index) : (serverIdx >= 0 ? serverIdx : 0);
        console.log('DisplayQuestion.loadQuestion - serverIdx:', serverIdx, 'chosen displayIdx:', idx);
        setLocalIndex(idx);
        localIndexRef.current = idx;
        // restore UI if provided
        if (restore) {
          setSelectedOption(typeof restore.selectedOption !== 'undefined' ? restore.selectedOption : null);
          setIsRevealed(typeof restore.isRevealed !== 'undefined' ? restore.isRevealed : false);
          setCorrectOption(typeof restore.correctOption !== 'undefined' ? restore.correctOption : null);
          setMessage(typeof restore.message !== 'undefined' ? restore.message : null);
          setTimeLeft(typeof restore.timeLeft !== 'undefined' ? Number(restore.timeLeft) : 20);
          try { sessionStorage.removeItem(`quiz_restore_${quizId}`); } catch(e){}
        }
        setInitialized(true);
        initializedRef.current = true;
        displayIdx = idx;
      }
      // always update quizDetails and derive the currently displayed question from displayIdx
      const questionObj = details?.questions?.[displayIdx] || details?.questions?.[0] || null;
      if (questionObj) setQuestion({ questionId: questionObj.id, text: questionObj.text, options: questionObj.options.map(o => ({ id: o.id, text: o.text })) , timeLimit: questionObj.timeLimit });
      else setQuestion(null);
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

  // If we are coming back from Ranking with restoreState, apply it immediately
  useEffect(() => {
    // first prefer navigation state
    let restore = location?.state && location.state.restoreState ? location.state.restoreState : null;
    // fallback to sessionStorage if navigation state not present
    if (!restore) {
      try {
        const raw = sessionStorage.getItem(`quiz_restore_${quizId}`);
        if (raw) {
          restore = JSON.parse(raw);
          // remove after reading to avoid stale restores
          sessionStorage.removeItem(`quiz_restore_${quizId}`);
        }
      } catch (e) {
        console.warn('failed reading restore from sessionStorage', e);
      }
    }
    if (restore) console.log('DisplayQuestion.useEffect(apply restore) - applying restore from location/sessionStorage:', restore);
    if (restore) {
      const idx = typeof restore.index !== 'undefined' ? Number(restore.index) : 0;
      setLocalIndex(idx);
      localIndexRef.current = idx;
      setSelectedOption(typeof restore.selectedOption !== 'undefined' ? restore.selectedOption : null);
      setIsRevealed(typeof restore.isRevealed !== 'undefined' ? restore.isRevealed : false);
      setCorrectOption(typeof restore.correctOption !== 'undefined' ? restore.correctOption : null);
      setMessage(typeof restore.message !== 'undefined' ? restore.message : null);
      setTimeLeft(typeof restore.timeLeft !== 'undefined' ? Number(restore.timeLeft) : 20);
      // remove restoreState from history so it won't be reapplied on refresh/navigation
      try { window.history.replaceState({}, document.title, window.location.pathname); } catch(e){}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state]);

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

  // keep refs updated when state changes
  useEffect(() => { localIndexRef.current = localIndex; }, [localIndex]);
  useEffect(() => { initializedRef.current = initialized; }, [initialized]);

  // Selecting an option locally; submission happens on reveal (button click) or timeout
  const handleOption = (optionId) => {
    // admin cannot play
    if (isAdmin) return;
    if (isSubmitting || isRevealed) return;
    setSelectedOption(optionId);
  };

  

  const nextQuestion = async () => {
    if (!quizDetails) return;
    const idx = Math.min(quizDetails.questions.length - 1, (localIndex || 0) + 1);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setLocalIndex(idx);
    localIndexRef.current = idx;
    const questionObj = quizDetails.questions[idx];
    if (questionObj) setQuestion({ questionId: questionObj.id, text: questionObj.text, options: questionObj.options.map(o => ({ id: o.id, text: o.text })), timeLimit: questionObj.timeLimit });
    setSelectedOption(null);
    setCorrectOption(null);
    setIsRevealed(false);
    setMessage(null);
    setTimeLeft(20);
    // do not sync server; local navigation only
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
      // If mock data exists in localStorage, submit locally using the displayed question (localIndex)
      const mockRaw = localStorage.getItem('mock_quizzes');
      if (mockRaw) {
        try {
          const quizzes = JSON.parse(mockRaw || '[]');
          const q = quizzes.find(x => x.id === Number(quizId));
          const questionObj = q?.questions?.[localIndex];
          const correctOpt = questionObj?.options?.find(o => o.correct) || null;
          const correctOptId = correctOpt ? correctOpt.id : null;
          const selected = selectedOption || 0;
          const correct = correctOptId && Number(selected) === Number(correctOptId);
          // update player's record
          const playerId = localStorage.getItem('mock_player_id') || `p_${Date.now()}`;
          localStorage.setItem('mock_player_id', playerId);
          let player = q.players.find(p => p.id === playerId);
          if (!player) {
            player = { id: playerId, name: `Player ${q.players.length + 1}`, score: 0, answers: [] };
            q.players.push(player);
          }
          player.answers = player.answers || [];
          player.answers.push({ questionId: questionObj.id, selected: Number(selected), correct: !!correct });
          if (correct) player.score = (player.score || 0) + 1;
          // write back
          localStorage.setItem('mock_quizzes', JSON.stringify(quizzes));
          setMessage(correct ? 'Correct!' : 'Wrong');
          setCorrectOption(correctOptId || null);
          setIsRevealed(true);
          setIsSubmitting(false);
        } catch (err) {
          console.error('mock submit error', err);
          setIsSubmitting(false);
        }
        return;
      }

      // otherwise call real API submit
      const optToSubmit = selectedOption || 0;
      const res = await quizAPI.submitAnswer(quizId, optToSubmit, token);
      setMessage(res.correct ? 'Correct!' : 'Wrong');
      setCorrectOption(res.correctOptionId || null);
      // reveal answers but DO NOT auto-advance; wait for user to click Next
      setIsRevealed(true);
      setIsSubmitting(false);
    } catch (err) {
      console.error('reveal/submit error', err);
      setIsSubmitting(false);
    }
  };

  const showLeaderboard = async () => {
    // persist restore state to sessionStorage (fallback) and navigate to ranking
    const restore = {
      index: localIndexRef.current,
      selectedOption,
      isRevealed,
      correctOption,
      message,
      timeLeft
    };
    console.log('DisplayQuestion.showLeaderboard - saving restore to sessionStorage and navigating to Ranking:', restore);
    try { sessionStorage.setItem(`quiz_restore_${quizId}`, JSON.stringify(restore)); } catch(e) { console.warn('sessionStorage set failed', e); }
    // also pass via navigation state for immediate roundtrip
    navigate(`/quiz/${quizId}/ranking`, { state: { restoreState: restore } });
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
              <div style={{flex:1}} />
              {isAdmin && (
                <button className="action-button" onClick={nextQuestion} disabled={!quizDetails || localIndex >= (quizDetails?.questions?.length - 1)}>Next</button>
              )}
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
              {isAdmin && (
                <>
                  <button className="action-button" onClick={revealAnswers}>Show answer</button>
                  <button className="action-button" onClick={showLeaderboard}>Show leaderboard</button>
                </>
              )}
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
