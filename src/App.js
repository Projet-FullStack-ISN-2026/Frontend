import './assets/App.css';
import Navbar from './layouts/navbar'
import logo from './assets/logo_tf8.png';

function App() {
  return (
    <div className="App">
      <Navbar />
      <header className="App-header">
        <h1>Bienvenue sur le grand Quiz de TF8 !</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, 
          sed do eiusmod tempor incididunt ut labore et dolore magna 
          aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo
           consequat. Duis aute irure dolor in reprehenderit in voluptate velit 
          esse cillum dolore eu fugiat nulla pariatur. 
          Excepteur sint occaecat cupidatat non proident, 
          sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </header>
    </div>
  );
}

export default App;
