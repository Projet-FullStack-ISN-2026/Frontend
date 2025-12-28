import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { quizAPI } from '../../services/quizAPI';
import "./Modify_template.css";

function ModifyQuestion() {
  const { quizID, questionId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  const loadQuestion = async () => {
    if (!quizID || !questionId) return;
    try {
      setLoading(true);
      const data = await quizAPI.getQuizDetails(quizID);
      if (!data) {
        setError('Quiz introuvable');
        return;
      }
      const q = (data.questions || []).find(q => String(q.id) === String(questionId));
      if (!q) {
        setError('Question introuvable dans ce quiz');
        return;
      }
      // normalize shape
      setQuestion({ id: q.id, text: q.text ?? q.title ?? q.question ?? '', options: q.options ?? [] });
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuestion(); }, [quizID, questionId]);

  const handleUpdate = async () => {
    if (!question) return;
    try {
      // Attempt API update
      await quizAPI.updateQuestion(question.id, { question: question.text, options: question.options });
      alert('Question mise à jour');
      setEditing(false);
      loadQuestion();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erreur mise à jour');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Confirmer la suppression de la question ?')) return;
    try {
      await quizAPI.deleteQuestion(quizID, question.id);
      alert('Question supprimée');
      navigate(`/ModifyQuiz/${quizID}`);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Erreur suppression');
    }
  };

  if (!quizID || !questionId) {
    return (
      <div className="main modify-quiz">
        <h1>Modifier une question</h1>
        <div className="empty-list">
          <p>Paramètres manquants (quiz ou question).</p>
          <p>Va sur la page <Link to="/ModifyQuiz">Modifier un quiz</Link> puis choisis une question.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main modify-quiz">
      <h1>Modifier la question</h1>
      {loading && <div>Chargement...</div>}
      {error && <div className="empty-list">{error} — <Link to={`/ModifyQuiz/${quizID}`}>Retour au quiz</Link></div>}

      {question && (
        <div className="questions-list">
          <div className="question-block">
            <div className="question-content">
              {!editing ? (
                <h3 className="question-text">{question.text}</h3>
              ) : (
                <textarea className="edit-textarea" value={question.text} onChange={e => setQuestion({...question, text: e.target.value})} />
              )}
            </div>

            <div className="question-actions">
              <button className="btn-mod" onClick={() => setEditing(!editing)}>{editing ? 'Modifier le texte' : 'Éditer'}</button>
              {editing && <button className="btn-mod" onClick={handleUpdate}>Sauvegarder</button>}
              <button className="btn-mod danger" onClick={handleDelete}>Supprimer</button>
            </div>
          </div>

          <div className="options-section">
            <h3 className="options-title">Options</h3>
            <div className="options-list">
              {question.options.map((opt, idx) => (
                <div key={idx} className="option-row">
                  <input className="option-input" value={opt.text} onChange={e => {
                    const opts = question.options.map((o,i) => i===idx?{...o,text:e.target.value}:o);
                    setQuestion({...question, options:opts});
                  }} />
                  <label className="option-label"><input className="option-checkbox" type="checkbox" checked={!!opt.correct} onChange={e => {
                    const opts = question.options.map((o,i) => i===idx?{...o,correct:e.target.checked}:o);
                    setQuestion({...question, options:opts});
                  }} /> Correct</label>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default ModifyQuestion;
