import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../assets/inscription.css';

const Inscription = () => {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useContext(AuthContext);
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    //rediriger vers quizzes si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/quizzes');
        }
    }, [isAuthenticated, navigate]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { firstName, lastName, email, password };
            const res = await (await import('../../services/authAPI')).default.register(payload);
            if (res && res.token) {
                login(res);
                navigate('/quizzes');
            } else {
                navigate('/connexion');
            }
        } catch (err) {
            console.error('Erreur inscription:', err);
            setError(err.message || 'Erreur lors de l\'inscription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inscription-page">
            <form className="inscription-form" onSubmit={handleSubmit}>
                <h2 className="inscription-header">INSCRIPTION</h2>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="nom">NOM</label>
                    <input type="text" id="nom" className="inscription-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="prenom">PRENOM</label>
                    <input type="text" id="prenom" className="inscription-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="mail">MAIL</label>
                    <input type="email" id="mail" className="inscription-input" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="motdepasse">MOT DE PASSE</label>
                    <input type="password" id="motdepasse" className="inscription-input" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="confirmer">CONFIRMER LE MOT DE PASSE</label>
                    <input type="password" id="confirmer" className="inscription-input" required/>
                </div>

                {error && <div className="inscription-error">{error}</div>}
                <button type="submit" className="inscription-submit-button" disabled={loading}>
                    {loading ? 'En cours...' : 'Valider l\'inscription'}
                </button>
            </form>
        </div>
    );
};

export default Inscription;