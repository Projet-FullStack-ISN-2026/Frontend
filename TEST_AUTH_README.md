# 🔐 Système d'Authentification - Instructions de Test

## Compte de Test en Dur

Un compte de test a été créé pour faciliter vos tests :

### Identifiants
- **Email** : `test@example.com`
- **Mot de passe** : `password123`

## Fonctionnalités Implémentées

### 1. **Authentification avec Contexte React**
- Créé un `AuthContext` pour gérer l'état d'authentification globalement
- Utilisation du `localStorage` pour persister la session utilisateur
- Vérification automatique de la session au chargement de l'app

### 2. **Page de Connexion Améliorée**
- Validation des identifiants en front-end
- Messages d'erreur personnalisés
- Affichage des identifiants de test sur la page
- Redirection automatique vers `/GenerateQuiz` après connexion réussie

### 3. **Routes Protégées**
- La page `/GenerateQuiz` est maintenant protégée
- Redirection automatique vers `/connexion` si l'utilisateur n'est pas authentifié

### 4. **Navbar Dynamique**
- Affichage conditionnel des liens selon l'état d'authentification
- Affichage de l'email de l'utilisateur connecté
- Bouton de déconnexion qui nettoie la session

## Comment Tester

### 1. Démarrez l'application
```bash
npm start
```

### 2. Accédez à la page d'accueil
```
http://localhost:3000/
```

### 3. Cliquez sur "Connexion" dans la navbar

### 4. Entrez les identifiants de test
- Email: `test@example.com`
- Mot de passe: `password123`

### 5. Vous serez redirigé vers `/GenerateQuiz`

### 6. Utilisez la navbar pour :
- Voir votre email connecté
- Cliquer sur "Déconnexion" pour vous déconnecter

## Scénarios de Test

### ✅ Connexion Réussie
1. Email correct + Mot de passe correct → Redirection vers GenerateQuiz

### ❌ Connexion Échouée
1. Email incorrect → Message d'erreur
2. Mot de passe incorrect → Message d'erreur

### 🔒 Protection des Routes
1. Essayez d'accéder à `/GenerateQuiz` sans être connecté → Redirection vers `/connexion`

### 💾 Persistance de Session
1. Connectez-vous
2. Rafraîchissez la page (F5)
3. Vous restez connecté ✓

### 🚪 Déconnexion
1. Cliquez sur "Déconnexion"
2. Vous êtes redirigé à l'accueil
3. Essayez d'accéder à `/GenerateQuiz` → Redirection vers `/connexion`

## Fichiers Modifiés

- ✅ `src/connexion.js` - Ajout de la logique d'authentification
- ✅ `src/App.js` - Intégration d'AuthProvider et routes protégées
- ✅ `src/layouts/navbar.jsx` - Affichage dynamique et déconnexion
- ✨ `src/contexts/AuthContext.js` - Nouveau contexte d'authentification

## Notes Importantes

- Le contexte est situé dans `src/contexts/AuthContext.js`
- Les données sont stockées dans `localStorage` (clé: `currentUser`)
- Aucune API backend n'est appelée (validation front-end uniquement)
- À remplacer par une API réelle pour la production

