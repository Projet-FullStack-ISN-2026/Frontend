import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { quizAPI } from '../../services/quizAPI';
import "./Modify_template.css";
import { AuthContext } from "../../contexts/AuthContext";

function ModifyQuiz() {
    const { quizID } = useParams();  
    const navigate = useNavigate();
    const { token } = useContext(AuthContext) || {};
    const [questions, setQuestions] = useState([]);
    const [quizList, setQuizList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // { id, question, options }
    const [pendingGeneratedQuiz, setPendingGeneratedQuiz] = useState(null);

    const quizIdNumber = useMemo(() => {
        const n = Number(quizID);
        return Number.isFinite(n) ? n : null;
    }, [quizID]);

    // The system expects 4 options always — present exactly 4 editable option fields
    const [newQuestion, setNewQuestion] = useState({ text: '', options: [
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false },
        { text: '', correct: false }
    ], timeLimit: 30 });

    const loadQuestions = async () => {
        if (!quizID) return;

        // If a generated quiz is present in sessionStorage for this quiz, display it
        try {
            const raw = sessionStorage.getItem('generatedQuiz');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && Number(parsed.id) === Number(quizID) && Array.isArray(parsed.questions)) {
                    setPendingGeneratedQuiz(parsed);
                    setQuestions(parsed.questions);
                    setLoading(false);
                    return;
                }
            }
        } catch (e) {
            // ignore parse errors and continue with API
        }

        try {
            setLoading(true);
            const data = await quizAPI.getQuizDetails(quizID, token);
            if (!data) {
                alert('Quiz non trouvé.');
                navigate('/ModifyQuiz');
                return;
            }
            const qs = data.questions || data.questionsList || [];
            setQuestions(qs);
            console.log('API GET 200', data);
        } catch (err) {
            console.error('Erreur GET', err);
            alert('Erreur lors du chargement des questions');
            navigate('/ModifyQuiz');
        } finally {
            setLoading(false);
        }
    };
    function handleGeneratequiz() {
        navigate(`/GenerateQuiz/${quizID}`);
    }
    const loadQuizList = async () => {
        try {
            // support different naming between mock and prod implementations
            const getAllFn = quizAPI.getAllQuiz ?? quizAPI.getAllQuizzes ?? quizAPI.getAllquiz ?? quizAPI.getAll_quizzes;
            let list = [];
            if (typeof getAllFn === 'function') {
                list = await getAllFn();
            } else {
                // fallback: read mock data directly from localStorage
                const raw = localStorage.getItem('mock_quizzes');
                const arr = raw ? JSON.parse(raw) : [];
                list = arr.map(q => ({ id: q.id, title: q.title, questions: q.questions?.length || 0 }));
            }
            setQuizList(list || []);
        } catch (err) {
            console.warn('Erreur récupération liste quiz', err);
            // try fallback to localStorage mock
            const raw = localStorage.getItem('mock_quizzes');
            const arr = raw ? JSON.parse(raw) : [];
            const list = arr.map(q => ({ id: q.id, title: q.title, questions: q.questions?.length || 0 }));
            setQuizList(list || []);
        }
    };

    const deleteQuestion = async (questionId) => {
        if (!quizID) return;
        if (!window.confirm('Confirmer la suppression de la question ?')) return;

        if (pendingGeneratedQuiz) {
            const next = (questions || []).filter(q => Number(q.id) !== Number(questionId));
            setQuestions(next);
            const updated = { ...pendingGeneratedQuiz, questions: next };
            setPendingGeneratedQuiz(updated);
            sessionStorage.setItem('generatedQuiz', JSON.stringify(updated));
            return;
        }

        try {
            await quizAPI.deleteQuestion(quizID, questionId);
            alert('Question supprimée !');
            loadQuestions(); 
        } catch (err) {
            console.error('Erreur DELETE', err);
            alert(err.message || 'Erreur suppression');
        }
    };

    const updateQuestion = async (questionId, questionData) => {
        if (pendingGeneratedQuiz) {
            const next = (questions || []).map(q => {
                if (Number(q.id) !== Number(questionId)) return q;
                const nextText = questionData.question ?? questionData.text ?? q.text ?? q.title;
                const nextOptions = Array.isArray(questionData.options) ? questionData.options : (q.options || []);
                return {
                    ...q,
                    text: nextText,
                    title: q.title,
                    options: nextOptions,
                };
            });
            setQuestions(next);
            const updated = { ...pendingGeneratedQuiz, questions: next };
            setPendingGeneratedQuiz(updated);
            sessionStorage.setItem('generatedQuiz', JSON.stringify(updated));
            alert('Question mise à jour !');
            setEditing(null);
            return;
        }

        try {
            await quizAPI.updateQuestion(questionId, questionData);
            alert('Question mise à jour !');
            setEditing(null);
            loadQuestions();
        } catch (err) {
            console.error('Erreur PUT', err);
            alert(err.message || 'Erreur mise à jour');
        }
    };

    // Add a new question (tries quizAPI.addQuestion, else falls back to mock localStorage or direct POST)
    const addQuestion = async () => {
        try {
            // minimal validation
            if (!newQuestion.text || newQuestion.text.trim().length < 3) {
                alert('Renseigne le texte de la question (au moins 3 caractères)');
                return;
            }
            const validOptions = (newQuestion.options || []).filter(o => o.text && o.text.trim().length > 0);
            if (validOptions.length < 2) {
                alert('Ajoute au moins 2 options valides');
                return;
            }

            if (pendingGeneratedQuiz) {
                const nextId = questions && questions.length ? Math.max(...questions.map(x => Number(x.id) || 0)) + 1 : 1;
                const opts = (newQuestion.options || []).map((o, idx) => ({ id: idx + 1, text: o.text, correct: !!o.correct }));
                const qObj = { id: nextId, text: newQuestion.text, options: opts, timeLimit: newQuestion.timeLimit || 30 };
                const next = [...(questions || []), qObj];
                setQuestions(next);
                const updated = { ...pendingGeneratedQuiz, questions: next };
                setPendingGeneratedQuiz(updated);
                sessionStorage.setItem('generatedQuiz', JSON.stringify(updated));
            } else {
                // try API method names
                if (typeof quizAPI.addQuestion === 'function') {
                    await quizAPI.addQuestion(quizID, { question: newQuestion.text, options: newQuestion.options, timeLimit: newQuestion.timeLimit });
                } else if (typeof quizAPI.createQuestion === 'function') {
                    await quizAPI.createQuestion(quizID, { question: newQuestion.text, options: newQuestion.options, timeLimit: newQuestion.timeLimit });
                } else {
                    // fallback to mock in localStorage
                    const raw = localStorage.getItem('mock_quizzes');
                    const arr = raw ? JSON.parse(raw) : [];
                    const qIndex = arr.findIndex(q => Number(q.id) === Number(quizID));
                    if (qIndex === -1) throw new Error('Quiz introuvable en mock');
                    const quiz = arr[qIndex];
                    const nextId = quiz.questions && quiz.questions.length ? Math.max(...quiz.questions.map(x=>x.id)) + 1 : 1;
                    const opts = (newQuestion.options || []).map((o, idx) => ({ id: idx+1, text: o.text, correct: !!o.correct }));
                    const qObj = { id: nextId, text: newQuestion.text, options: opts, timeLimit: newQuestion.timeLimit || 30 };
                    quiz.questions = quiz.questions || [];
                    quiz.questions.push(qObj);
                    arr[qIndex] = quiz;
                    localStorage.setItem('mock_quizzes', JSON.stringify(arr));
                }
            }

            alert('Question ajoutée !');
            setNewQuestion({ text: '', options: [ { text: '', correct: false }, { text: '', correct: false }, { text: '', correct: false }, { text: '', correct: false } ], timeLimit: 30 });
            if (!pendingGeneratedQuiz) {
                loadQuestions();
            }
        } catch (err) {
            console.error('Erreur ADD', err);
            alert(err.message || 'Erreur ajout de la question');
        }
    };

    const handleValidateGeneratedQuiz = async () => {
        if (!pendingGeneratedQuiz || !quizIdNumber) return;
        try {
            setLoading(true);
            const payload = { ...pendingGeneratedQuiz, id: quizIdNumber, questions: questions || [] };
            if (typeof quizAPI.updateQuiz === 'function') {
                await quizAPI.updateQuiz(quizIdNumber, payload, token);
            } else {
                // fallback: attempt update via updateQuestion API is not applicable
                throw new Error('updateQuiz non disponible');
            }
            sessionStorage.removeItem('generatedQuiz');
            setPendingGeneratedQuiz(null);
            alert('Changements validés !');
            await loadQuestions();
        } catch (err) {
            console.error('Erreur validation quiz:', err);
            alert(err.message || 'Erreur lors de la validation');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (quizID) loadQuestions();
        else loadQuizList();
    }, [quizID]);

    if (!quizID) {
        return (
            <div className="main modify-quiz">
                <button className="back-cross" onClick={() => navigate(-1)} aria-label="Retour">✕</button>
                <h1>Choisir un quiz à modifier</h1>
                {quizList.length === 0 ? (
                  <div className="empty-list">
                    <p>Aucun quiz trouvé via l'API.</p>
                    <p>Si tu veux, tu peux en créer un nouveau ou vérifier que l'API est démarrée.</p>
                    <div style={{marginTop:12}}>
                      <Link className="btn-mod" to="/GenerateQuiz">Créer un Quiz</Link>
                    </div>
                  </div>
                ) : (
                <ul className="questions-list">
                    {quizList.map(q => (
                        <li key={q.id} style={{marginBottom:12}}>
                            <strong>{q.title}</strong>
                            <span className="meta">{q.questions ?? 0} questions</span>
                            <Link to={`/ModifyQuiz/${q.id}`}>Modifier</Link>
                        </li>
                    ))}
                </ul>
                )}
            </div>
        );
    }

    return (
        <div className="main modify-quiz">
            <button className="back-cross" onClick={() => navigate(-1)} aria-label="Retour">✕</button>
            <h1>Modifier le Quiz</h1>
            {loading && <div>Chargement...</div>}

            {/* Add question button */}
            <div style={{margin: '10px 0 18px 0'}}>
                <button className="btn-mod" onClick={() => handleGeneratequiz()}>Ajouter une question</button>
            </div>

            {pendingGeneratedQuiz && (
                <div style={{margin: '0 0 18px 0'}}>
                    <button className="btn-mod" onClick={handleValidateGeneratedQuiz} disabled={loading}>
                        Valider
                    </button>
                </div>
            )}

            {questions.map(q => (
                <div key={q.id} className="question-block">
                    <h3>{q.title || q.text}</h3>

                    <button onClick={() => deleteQuestion(q.id)}>Supprimer</button>

                    <button onClick={() => setEditing({ id: q.id, question: q.title || q.text, options: q.options || [] })}>
                        Éditer
                    </button>
                </div>
            ))}


            {editing && (
                <div className="edit-modal">
                    <h3>Éditer la question</h3>
                    <textarea value={editing.question} onChange={e => setEditing({ ...editing, question: e.target.value })} />
                    <div className="options-edit">
                        {editing.options.map((opt, i) => (
                            <div key={i}>
                                <input value={opt.text} onChange={e => {
                                    const newOpts = editing.options.map(o => o === opt ? { ...o, text: e.target.value } : o);
                                    setEditing({ ...editing, options: newOpts });
                                }} />
                                <label>
                                    <input type="checkbox" checked={!!opt.correct} onChange={e => {
                                        const newOpts = editing.options.map(o => o === opt ? { ...o, correct: e.target.checked } : o);
                                        setEditing({ ...editing, options: newOpts });
                                    }} /> Correct
                                </label>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => updateQuestion(editing.id, { question: editing.question, options: editing.options })}>Sauvegarder</button>
                    <button onClick={() => setEditing(null)}>Annuler</button>
                </div>
            )}
        </div>
    );
}

export default ModifyQuiz;
