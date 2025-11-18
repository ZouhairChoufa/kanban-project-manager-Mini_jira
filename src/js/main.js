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
import { initAuthListeners, getFriendlyAuthError } from './modules/auth.js';
import { initProfileListeners, setupUser, setupUsersListener } from './modules/profile.js';
import { initProjectsListeners, setupProjectsListener, renderCurrentView } from './modules/projects.js';
import { initKanbanListeners } from './modules/kanban.js';
import { initDashboardListeners } from './modules/dashboard.js';

let projectsUnsubscribe = null;
let firestoreUnsubscribe = null;
let usersUnsubscribe = null;

onAuthStateChanged(auth, (user) => {
    setLoading(true);
    if (projectsUnsubscribe) projectsUnsubscribe();
    if (firestoreUnsubscribe) firestoreUnsubscribe();
    if (usersUnsubscribe) usersUnsubscribe();

    if (user) {
        updateCurrentUser(user); 
        setupUser();
        updateCurrentProjectId(null);
        usersUnsubscribe = setupUsersListener(checkAndRenderApp); 
        projectsUnsubscribe = setupProjectsListener(checkAndRenderApp);
        
        dom.appContainer.classList.remove('hidden');
        dom.authContainer.classList.add('hidden');
        
    } else {
        updateCurrentUser(null);
        updateAllTasks([]);
        updateAllUsers([]);
        updateAllProjects([]);
        updateCurrentProjectId(null);
        
        updateHasTasksLoaded(false);
        updateHasUsersLoaded(false);
        updateHasProjectsLoaded(false);
        
        renderCurrentView();
        
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
        showToast({ variant: "destructive", title: "Error", description: getFriendlyAuthError(error) });
    }
}

function checkAndRenderApp() {
    if (state.hasUsersLoaded && state.hasProjectsLoaded) {
        console.log("Both users and projects loaded. Rendering app.");
        renderCurrentView();
        setLoading(false);
    } else {
    }
}

function setupEventListeners() {
    initAuthListeners();
    dom.logoutBtn.addEventListener('click', handleLogout);
    
    initProfileListeners();

    initProjectsListeners();
    
    initKanbanListeners();

    initDashboardListeners();
}

function init() {
    setLoading(true);
    setupEventListeners();
}

init();
