import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import '../../assets/inscription.css';
import showAlert from '../../pop_up';

const Inscription = () => {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useContext(AuthContext);
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    
    //rediriger vers quiz si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/quiz');
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
                showAlert("Successful registration !")
                navigate('/quiz');
            } else {
                navigate('/connexion');
            }
        } catch (err) {
            console.error('Erreur inscription:', err);
            showAlert("Error during the registration !")
            setError(err.message || 'Error during the registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inscription-page">
            <form className="inscription-form" onSubmit={handleSubmit}>
                <h2 className="inscription-header">Sign up</h2>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="nom">Last Name</label>
                    <input type="text" id="nom" className="inscription-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="prenom">First name</label>
                    <input type="text" id="prenom" className="inscription-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="mail">email</label>
                    <input type="email" id="mail" className="inscription-input" value={email} onChange={(e) => setEmail(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="motdepasse">password</label>
                    <input type="password" id="motdepasse" className="inscription-input" value={password} onChange={(e) => setPassword(e.target.value)} required/>
                </div>

                <div className="inscription-field-group">
                    <label className="inscription-label" htmlFor="confirmer">Confirm password</label>
                    <input type="password" id="confirmer" className="inscription-input" required/>
                </div>

                {error && <div className="inscription-error">{error}</div>}
                <button type="submit" className="inscription-submit-button" disabled={loading}>
                    {loading ? 'Loading...' : 'Validate the registration'}
                </button>
            </form>
            <div id="alert-container" style={{ position: 'fixed', top: '20px', right: '20px', zIndex : '9999'}}></div>
        </div>
    );
};

export default Inscription;