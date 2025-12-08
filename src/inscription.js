import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';


const inscriptionStyles = {
   
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
    submitButton: {
        width: '100%',
        padding: '12px',
        marginTop: '20px',
        borderRadius: '5px',
        backgroundColor: '#7c3da3', 
        border: '1px solid #7c3da3',
        color: 'white',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
};

const Inscription = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);
    
    // Rediriger vers quizzes si déjà connecté
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/quizzes');
        }
    }, [isAuthenticated, navigate]);
    
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Tentative d\'inscription...');
    };

    return (
        <div style={inscriptionStyles.pageContainer}>

        

            
            <form style={inscriptionStyles.formContainer} onSubmit={handleSubmit}>
                
                <h2 style={inscriptionStyles.header}>INSCRIPTION</h2>

                
                <div style={inscriptionStyles.fieldGroup}>
                    <label style={inscriptionStyles.label} htmlFor="nom">NOM</label>
                    <input type="text" id="nom" style={inscriptionStyles.input} required/>
                </div>
                
                <div style={inscriptionStyles.fieldGroup}>
                    <label style={inscriptionStyles.label} htmlFor="prenom">PRENOM</label>
                    <input type="text" id="prenom" style={inscriptionStyles.input} required/>
                </div>

                <div style={inscriptionStyles.fieldGroup}>
                    <label style={inscriptionStyles.label} htmlFor="mail">MAIL</label>
                    <input type="email" id="mail" style={inscriptionStyles.input} required/>
                </div>

                <div style={inscriptionStyles.fieldGroup}>
                    <label style={inscriptionStyles.label} htmlFor="motdepasse">MOT DE PASSE</label>
                    <input type="password" id="motdepasse" style={inscriptionStyles.input} required/>
                </div>

                <div style={inscriptionStyles.fieldGroup}>
                    <label style={inscriptionStyles.label} htmlFor="confirmer">CONFIRMER LE MOT DE PASSE</label>
                    <input type="password" id="confirmer" style={inscriptionStyles.input} required/>
                </div>

               
                <button type="submit" style={inscriptionStyles.submitButton}>
                    Valider l'inscription
                </button>
            </form>
        </div>
    );
};

export default Inscription;