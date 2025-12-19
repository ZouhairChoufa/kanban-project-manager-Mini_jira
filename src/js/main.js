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
import { renderSidebar } from './modules/navigation.js';
import { renderHeaderAuthUI, initHeaderAuthListeners } from './modules/headerAuth.js';

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
        
        // Initialize sidebar in global mode
        renderSidebar('global');
        renderHeaderAuthUI();
        
        dom.appContainer.classList.remove('hidden');
        dom.authContainer.classList.add('hidden');
        
        // Re-render icons after showing app
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }, 100);
        
    } else {
        updateCurrentUser(null);
        updateAllTasks([]);
        updateAllUsers([]);
        updateAllProjects([]);
        updateCurrentProjectId(null);
        
        updateHasTasksLoaded(false);
        updateHasUsersLoaded(false);
        updateHasProjectsLoaded(false);
        
        // Show app with public home page
        setupUser();
        renderSidebar('public');
        renderHeaderAuthUI();
        renderCurrentView();
        
        dom.appContainer.classList.remove('hidden');
        dom.authContainer.classList.add('hidden');
        setLoading(false);
        
        // Re-render icons
        setTimeout(() => {
            if (typeof lucide !== 'undefined' && lucide.createIcons) {
                lucide.createIcons();
            }
        }, 100);
    }
});



function checkAndRenderApp() {
    if (state.hasUsersLoaded && state.hasProjectsLoaded) {
        console.log("Both users and projects loaded. Rendering app.");
        renderCurrentView();
        setLoading(false);
    }
}

function setupEventListeners() {
    initAuthListeners();
    
    initProfileListeners();

    initProjectsListeners();
    
    initKanbanListeners();

    initDashboardListeners();
    
    initHeaderAuthListeners();
}

function init() {
    setLoading(true);
    setupEventListeners();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

init();
