import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

// Compte en dur pour les tests
const TEST_ACCOUNT = {
  email: 'test@example.com',
  password: 'password123'
};

const formStyles = {

    pageContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        paddingTop: '50px', 
        background: 'linear-gradient(180deg, #010005, #28017c, #770056)', 
        color: 'white',
        boxSizing: 'border-box' 
    },

    formContainer: {
        width: '90%',
        maxWidth: '500px',
        padding: '30px',
        borderRadius: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.1)',

        marginBottom: '50px' 
    },
    header: {
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '30px',
    },
    fieldGroup: {
        marginBottom: '20px',
    },
    label: {
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '5px',
        display: 'block',
    },
    input: {
        width: '100%',
        padding: '12px 15px',
        borderRadius: '5px',
        border: 'none',
        backgroundColor: 'rgba(255, 255, 255, 0.2)', 
        color: 'white',
        fontSize: '16px',
        boxSizing: 'border-box',
    },
    connectButton: {
        width: '100%',
        padding: '12px',
        marginTop: '10px',
        borderRadius: '5px',
        border: '1px solid white', 
        backgroundColor: 'transparent', 
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    signupLink: {
        display: 'block',
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '14px',
        color: 'white',
        textDecoration: 'none',
    },
    formIcons: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        fontSize: '18px',
        fontWeight: 'bold',
    },
    testInfo: {
        backgroundColor: 'rgba(100, 200, 255, 0.2)',
        border: '1px solid rgba(100, 200, 255, 0.5)',
        borderRadius: '5px',
        padding: '10px',
        marginTop: '20px',
        fontSize: '12px',
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.8)'
    }
};

const Connection = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Validation avec le compte en dur
        if (email === TEST_ACCOUNT.email && password === TEST_ACCOUNT.password) {
            console.log('✓ Connexion réussie !');
            login(email); // Sauvegarder la session
            // Redirection vers la page de génération de quiz après connexion
            navigate('/GenerateQuiz');
        } else {
            setError('Email ou mot de passe incorrect');
            console.log('✗ Identifiants invalides');
        }
    };

    return (
        <div style={formStyles.pageContainer}>

            <form style={formStyles.formContainer} onSubmit={handleSubmit}>
                
                <div style={formStyles.formIcons}>
                    <span style={{ cursor: 'pointer', fontSize: '20px' }}>👤</span> 
                </div>

                <h2 style={formStyles.header}>Connexion</h2>

                <div style={formStyles.fieldGroup}>
                    <label style={formStyles.label} htmlFor="email">MAIL</label>
                    <input 
                        type="email" 
                        id="email" 
                        placeholder="Votre adresse e-mail" 
                        style={formStyles.input} 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div style={formStyles.fieldGroup}>
                    <label style={formStyles.label} htmlFor="password">MOT DE PASSE</label>
                    <input 
                        type="password" 
                        id="password" 
                        placeholder="••••••••" 
                        style={formStyles.input} 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {error && (
                    <div style={{
                        padding: '10px',
                        marginBottom: '15px',
                        backgroundColor: 'rgba(255, 0, 0, 0.3)',
                        border: '1px solid #ff6666',
                        borderRadius: '5px',
                        color: '#ffaaaa',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                
                <button type="submit" style={formStyles.connectButton}>
                    Se connecter
                </button>

                
                <Link to="/inscription" style={formStyles.signupLink}>
                    Pas encore de compte : <strong>Inscrivez vous ici</strong>
                </Link>

                <div style={formStyles.testInfo}>
                    <strong>📝 Compte de test :</strong><br/>
                    Email: <code>test@example.com</code><br/>
                    Mot de passe: <code>password123</code>
                </div>
            </form>
        </div>
    );
};

export default Connection;