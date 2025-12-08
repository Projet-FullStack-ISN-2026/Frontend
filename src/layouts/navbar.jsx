import logo from '../assets/logo_tf8.png';

function Navbar(){
    return (
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
    <div className="container-fluid">
        <a className="navbar-brand" href="/">
            <img src={logo} alt="Logo" style={{height: '40px'}} />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
        <div className="navbar-nav">
            <a className="nav-link" href="/features/waitingScreen">Connexion</a>
            <a className="nav-link" href="#">Inscription</a>
            <a className="nav-link" href="/GenerateQuiz">GenerateQuiz</a>
        </div>
        </div>
    </div>
    </nav>
    )
}

export default Navbar