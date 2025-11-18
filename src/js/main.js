// Fichier: src/js/main.js
// Point d'entrée principal. Gère l'état global, l'auth et le routage des vues.

import { auth, onAuthStateChanged, signOut } from './core/firebase.js';
import { 
    state, 
    updateCurrentUser, 
    updateAllTasks, 
    updateAllUsers, 
    updateAllProjects, 
    updateCurrentProjectId, 
    updateHasTasksLoaded, 
    updateHasUsersLoaded, 
    updateHasProjectsLoaded 
} from './core/state.js';
import * as dom from './core/dom.js';
import { setLoading, showToast } from './utils.js';
// ** FIX: Imports corrigés **
import { initAuthListeners, getFriendlyAuthError } from './modules/auth.js';
import { initProfileListeners, setupUser, setupUsersListener } from './modules/profile.js';
import { initProjectsListeners, setupProjectsListener, renderCurrentView } from './modules/projects.js';
import { initKanbanListeners } from './modules/kanban.js';
import { initDashboardListeners } from './modules/dashboard.js';

// --- LISTENERS (GLOBAL) ---
let projectsUnsubscribe = null;
let firestoreUnsubscribe = null; // Géré par projects.js/kanban.js
let usersUnsubscribe = null;

// --- AUTHENTICATION ---

onAuthStateChanged(auth, (user) => {
    setLoading(true);
    // Détache tous les anciens listeners
    if (projectsUnsubscribe) projectsUnsubscribe();
    if (firestoreUnsubscribe) firestoreUnsubscribe(); // Note: géré dans projects.js
    if (usersUnsubscribe) usersUnsubscribe();

    if (user) {
        // L'utilisateur est connecté
        updateCurrentUser(user); 
        setupUser(); // Met à jour l'en-tête
        
        updateCurrentProjectId(null); // Revient toujours à la page des projets
        
        // Charge la liste globale des utilisateurs (pour les avatars/noms)
        usersUnsubscribe = setupUsersListener(checkAndRenderApp); 
        // Charge la liste des projets
        projectsUnsubscribe = setupProjectsListener(checkAndRenderApp); // Passe la fonction de callback
        
        dom.appContainer.classList.remove('hidden');
        dom.authContainer.classList.add('hidden');
        
    } else {
        // L'utilisateur est déconnecté
        updateCurrentUser(null);
        updateAllTasks([]);
        updateAllUsers([]);
        updateAllProjects([]);
        updateCurrentProjectId(null);
        
        updateHasTasksLoaded(false);
        updateHasUsersLoaded(false);
        updateHasProjectsLoaded(false);
        
        renderCurrentView(); // Affiche la vue des projets (vide)
        
        dom.appContainer.classList.add('hidden');
        dom.authContainer.classList.remove('hidden');
        setLoading(false);
    }
});

async function handleLogout() {
    try {
        await signOut(auth);
        showToast({ title: "Logged Out", description: "You have been logged out." });
    } catch (error) {
        console.error("Logout error:", error);
        // ** FIX: Utilisation de la fonction importée **
        showToast({ variant: "destructive", title: "Error", description: getFriendlyAuthError(error) });
    }
}

// --- FIRESTORE REAL-TIME LISTENERS (Setup) ---

/**
 * Vérifie si les données initiales (utilisateurs et projets) sont chargées avant de rendre la vue.
 */
function checkAndRenderApp() {
    if (state.hasUsersLoaded && state.hasProjectsLoaded) {
        console.log("Both users and projects loaded. Rendering app.");
        renderCurrentView();
        setLoading(false); // Cache le loader après le premier rendu complet
    } else {
        // console.log(`Waiting for data: users=${state.hasUsersLoaded}, projects=${state.hasProjectsLoaded}`);
    }
}

// ** FIX: setupUsersListener a été déplacé dans profile.js **
// ** FIX: renderCurrentView a été déplacé dans projects.js **


// --- EVENT LISTENER SETUP ---

/**
 * Initialise tous les écouteurs d'événements globaux.
 */
function setupEventListeners() {
    // Auth
    initAuthListeners();
    dom.logoutBtn.addEventListener('click', handleLogout);
    
    // Profile
    initProfileListeners();

    // Projets
    initProjectsListeners();
    
    // Kanban & Tâches
    initKanbanListeners();

    // Dashboard
    initDashboardListeners();
}

// --- APP INITIALIZATION ---
function init() {
    setLoading(true);
    setupEventListeners();
    // onAuthStateChanged va gérer le reste
}

// Lance l'application
init();