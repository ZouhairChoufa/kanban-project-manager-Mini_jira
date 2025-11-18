// Fichier: src/js/modules/auth.js
// Gère la logique d'authentification (login, signup, logout) et les erreurs.

import { 
    auth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
    db,
    doc,
    setDoc
} from '../core/firebase.js';
import * as dom from '../core/dom.js';
import { showToast } from '../utils.js';

// --- INITIALISATION ---

export function initAuthListeners() {
    // Écouteurs pour les formulaires
    dom.loginForm.addEventListener('submit', handleLogin);
    dom.signupForm.addEventListener('submit', handleSignUp);
    
    // Écouteurs pour basculer entre les formulaires
    dom.toggleToSignup.addEventListener('click', () => toggleAuthForms('signup'));
    dom.toggleToLogin.addEventListener('click', () => toggleAuthForms('login'));
}

// --- GESTION DES FORMULAIRES ---

async function handleSignUp(e) {
    e.preventDefault();
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    setAuthLoading(dom.signupSubmitBtn, true);
    dom.signupError.classList.add('hidden');

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Mettre à jour le profil Firebase Auth
        await updateProfile(userCredential.user, {
            displayName: username,
            photoURL: null 
        });
        
        // Créer un document utilisateur public dans Firestore
        const userDocRef = doc(db, "/artifacts/mini-jira-kanban-board/public/data/users", userCredential.user.uid);
        await setDoc(userDocRef, {
            displayName: username,
            uid: userCredential.user.uid,
            photoURL: null
        });
        
        showToast({ title: "Succès", description: "Compte créé! Veuillez vous connecter." });
        toggleAuthForms('login'); // Renvoie au login
        dom.signupForm.reset(); 
        
        // Déconnecte l'utilisateur pour qu'il doive se connecter manuellement
        await signOut(auth);
        
    } catch (error) {
        console.error("Sign up error:", error.code, error.message);
        dom.signupError.textContent = getFriendlyAuthError(error); // Utilise la fonction
        dom.signupError.classList.remove('hidden');
    } finally {
        setAuthLoading(dom.signupSubmitBtn, false);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    setAuthLoading(dom.loginSubmitBtn, true);
    dom.loginError.classList.add('hidden');

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showToast({ title: "Succès", description: "Connecté avec succès!" });
        // onAuthStateChanged dans main.js s'occupera du reste
    } catch (error) {
        console.error("Login error:", error.code, error.message);
        dom.loginError.textContent = getFriendlyAuthError(error); // Utilise la fonction
        dom.loginError.classList.remove('hidden');
    } finally {
        setAuthLoading(dom.loginSubmitBtn, false);
    }
}

// --- FONCTIONS UTILITAIRES (Spécifiques à l'Auth) ---

function toggleAuthForms(formToShow) {
    if (formToShow === 'signup') {
        dom.loginFormContainer.classList.add('hidden');
        dom.signupFormContainer.classList.remove('hidden');
    } else {
        dom.loginFormContainer.classList.remove('hidden');
        dom.signupFormContainer.classList.add('hidden');
    }
}

/**
 * Gère l'état de chargement des formulaires d'authentification.
 * @param {HTMLElement} button - Le bouton de soumission.
 * @param {boolean} isLoading - Statut de chargement.
 */
function setAuthLoading(button, isLoading) {
    button.disabled = isLoading;
    if (isLoading) {
        button.innerHTML = `<svg class="h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`;
    } else {
        button.innerHTML = button.id === 'login-submit-btn' ? 'Log In' : 'Create Account';
    }
}

/**
 * Traduit les codes d'erreur Firebase Auth en messages pour l'utilisateur.
 * @param {object} error - L'objet d'erreur de Firebase.
 * @returns {string} Un message d'erreur lisible.
 */
export function getFriendlyAuthError(error) {
    switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Email ou mot de passe invalide.';
        case 'auth/email-already-in-use':
            return 'Un compte avec cet email existe déjà.';
        case 'auth/weak-password':
            return 'Le mot de passe doit comporter au moins 6 caractères.';
        case 'auth/invalid-email':
            return 'Veuillez entrer une adresse email valide.';
        default:
            return 'Une erreur inattendue est survenue. Veuillez réessayer.';
    }
}