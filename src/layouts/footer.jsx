import React from 'react';
import '../assets/Footer.css';

const Footer = () => {
  return (
    <footer>
      <div>
        <p>© 2025 MonSiteWeb. Tous droits réservés.</p>
        <ul className="footer-links"> 
          <li><a href="/about">À propos</a></li>
          <li><a href="/contact">Contact</a></li>
          <li><a href="/privacy">Politique de confidentialité</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;