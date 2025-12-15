import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { quizAPI } from '../../services/quizAPI';
import "./Modify_template.css";

function ModifyQuiz() {
    const { quizID } = useParams();  
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [quizList, setQuizList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null); // { id, question, options }
    // New-question state
    const [showNewModal, setShowNewModal] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ text: '', options: [ { text: '', correct: false }, { text: '', correct: false } ], timeLimit: 30 });
    const storedQuiz = sessionStorage.getItem("generatedQuiz");
    
    const quiz = JSON.parse(storedQuiz);
    console.log("storedQuiz",quiz)
    sessionStorage.removeItem("generatedQuiz");

    const loadQuestions = async () => {
        if (!quizID) return;
        try {
            setLoading(true);
            const data = await quizAPI.getQuizDetails(quizID);
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

            alert('Question ajoutée !');
            setShowNewModal(false);
            setNewQuestion({ text: '', options: [ { text: '', correct: false }, { text: '', correct: false } ], timeLimit: 30 });
            loadQuestions();
        } catch (err) {
            console.error('Erreur ADD', err);
            alert(err.message || 'Erreur ajout de la question');
        }
    };

    useEffect(() => {
        if (quizID) loadQuestions();
        else loadQuizList();
    }, [quizID]);

    if (!quizID) {
        return (
            <div className="main modify-quiz">
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
            <h1>Modifier le Quiz</h1>
            {loading && <div>Chargement...</div>}

            {/* Add question button */}
            <div style={{margin: '10px 0 18px 0'}}>
                <button className="btn-mod" onClick={() => setShowNewModal(true)}>Ajouter une question</button>
            </div>

            {questions.map(q => (
                <div key={q.id} className="question-block">
                    <h3>{q.title || q.text}</h3>

                    <button onClick={() => deleteQuestion(q.id)}>Supprimer</button>

                    <button onClick={() => setEditing({ id: q.id, question: q.title || q.text, options: q.options || [] })}>
                        Éditer
                    </button>

                    <button
                        onClick={() => updateQuestion(q.id, { question: q.title || q.text, options: q.options })}
                    >
                        Mettre à jour
                    </button>
                </div>
            ))}

            {/* New question modal */}
            {showNewModal && (
                <div className="edit-modal">
                    <h3>Ajouter une question</h3>
                    <textarea placeholder="Texte de la question" value={newQuestion.text} onChange={e => setNewQuestion({...newQuestion, text: e.target.value})} />
                    <div className="options-edit">
                        {newQuestion.options.map((opt, idx) => (
                            <div className="opt-row" key={idx}>
                                <input type="text" value={opt.text} placeholder={`Option ${idx+1}`} onChange={e => {
                                    const opts = newQuestion.options.map((o,i) => i===idx ? {...o, text: e.target.value} : o);
                                    setNewQuestion({...newQuestion, options: opts});
                                }} />
                                <label><input type="checkbox" checked={!!opt.correct} onChange={e => {
                                    const opts = newQuestion.options.map((o,i) => i===idx ? {...o, correct: e.target.checked} : o);
                                    setNewQuestion({...newQuestion, options: opts});
                                }} /> Correct</label>
                                {newQuestion.options.length > 2 && (
                                    <button className="btn-mod secondary" onClick={() => {
                                        const opts = newQuestion.options.filter((_,i) => i!==idx);
                                        setNewQuestion({...newQuestion, options: opts});
                                    }}>Suppr</button>
                                )}
                            </div>
                        ))}
                        <div style={{marginTop:8}}>
                            <button className="btn-mod secondary" onClick={() => setNewQuestion({...newQuestion, options: [...newQuestion.options, { text: '', correct: false }]})}>Ajouter une option</button>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button className="btn-mod" onClick={addQuestion}>Créer</button>
                        <button className="btn-mod secondary" onClick={() => setShowNewModal(false)}>Annuler</button>
                    </div>
                </div>
            )}

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
