// Fichier: src/js/core/dom.js
// Centralise tous les sélecteurs d'éléments DOM pour un accès facile.

export const loadingOverlay = document.getElementById('loading-overlay');
export const appContainer = document.getElementById('app-container');
export const authContainer = document.getElementById('auth-container');
// ** FIX: Ajout du conteneur de toast manquant **
export const toastContainer = document.getElementById('toast-container');

// --- Formulaires d'Authentification ---
export const loginFormContainer = document.getElementById('login-form-container');
export const signupFormContainer = document.getElementById('signup-form-container');
export const loginForm = document.getElementById('login-form');
export const signupForm = document.getElementById('signup-form');
export const loginError = document.getElementById('login-error');
export const signupError = document.getElementById('signup-error');
export const loginSubmitBtn = document.getElementById('login-submit-btn');
export const signupSubmitBtn = document.getElementById('signup-submit-btn');
export const toggleToSignup = document.getElementById('toggle-to-signup');
export const toggleToLogin = document.getElementById('toggle-to-login');

// --- En-tête de l'Application ---
export const headerTitleLink = document.getElementById('header-title-link');
export const userInfo = document.getElementById('user-info');
export const headerAvatar = document.getElementById('header-avatar');
export const userDisplayName = document.getElementById('user-display-name');
export const logoutBtn = document.getElementById('logout-btn');

// --- Vues Principales ---
export const projectsView = document.getElementById('projects-view');
export const kanbanView = document.getElementById('kanban-view');
export const dashboardView = document.getElementById('dashboard-view'); 

// --- Vue Projets ---
export const createProjectBtn = document.getElementById('create-project-btn');
export const projectsList = document.getElementById('projects-list');

// --- Vue Kanban ---
export const backToProjectsBtn = document.getElementById('back-to-projects-btn');
export const kanbanProjectTitle = document.getElementById('kanban-project-title');
export const kanbanBoard = document.getElementById('kanban-board');
export const addTaskBtn = document.getElementById('add-task-btn');
export const fabAddTask = document.getElementById('fab-add-task');
export const showDashboardBtn = document.getElementById('show-dashboard-btn'); 

// --- Filtres Kanban ---
export const filterNameInput = document.getElementById('filter-name');
export const sortDateSelect = document.getElementById('sort-date');
export const filterCreatorSelect = document.getElementById('filter-creator');

// --- Modal de Tâche ---
export const taskModal = document.getElementById('task-modal');
export const closeModalBtn = document.getElementById('close-modal-btn');
export const cancelModalBtn = document.getElementById('cancel-modal-btn');
export const taskForm = document.getElementById('task-form');
export const modalTitle = document.getElementById('modal-title');
export const modalDescription = document.getElementById('modal-description');
export const taskIdInput = document.getElementById('task-id');
export const titleInput = document.getElementById('title');
export const titleError = document.getElementById('title-error');
export const descriptionInput = document.getElementById('description');
export const statusSelect = document.getElementById('status');
export const assigneeSelect = document.getElementById('assignee');
export const deleteTaskBtn = document.getElementById('delete-task-btn');
export const saveTaskBtn = document.getElementById('save-task-btn');
export const saveBtnText = document.getElementById('save-btn-text');

// --- Modal de Suppression ---
export const deleteModal = document.getElementById('delete-modal');
export const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
export const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// --- Modal de Profil ---
export const profileModal = document.getElementById('profile-modal');
export const closeProfileModalBtn = document.getElementById('close-profile-modal-btn');
export const profileAvatarContainer = document.getElementById('profile-avatar-container');
export const profileImageUpload = document.getElementById('profile-image-upload');
export const profileUploadBtn = document.getElementById('profile-upload-btn');
export const statsTodo = document.getElementById('stats-todo');
export const statsInProgress = document.getElementById('stats-inprogress');
export const statsDone = document.getElementById('stats-done');
export const profileUsernameForm = document.getElementById('profile-username-form');
export const profileUsernameInput = document.getElementById('profile-username');
export const profileSaveUsernameBtn = document.getElementById('profile-save-username-btn');
export const profileEmail = document.getElementById('profile-email');
export const profileResetPasswordBtn = document.getElementById('profile-reset-password-btn');

// --- Modal de Création de Projet ---
export const createProjectModal = document.getElementById('create-project-modal');
export const createProjectForm = document.getElementById('create-project-form');
export const closeCreateProjectModalBtn = document.getElementById('close-create-project-modal-btn');
export const cancelCreateProjectBtn = document.getElementById('cancel-create-project-btn');
export const saveProjectBtn = document.getElementById('save-project-btn');
export const projectNameError = document.getElementById('project-name-error');
export const projectCodeError = document.getElementById('project-code-error');

// --- Modal d'Accès au Projet ---
export const accessProjectModal = document.getElementById('access-project-modal');
export const accessProjectForm = document.getElementById('access-project-form');
export const closeAccessProjectModalBtn = document.getElementById('close-access-project-modal-btn');
export const cancelAccessProjectBtn = document.getElementById('cancel-access-project-btn');
export const submitAccessCodeBtn = document.getElementById('submit-access-code-btn');
export const accessCodeError = document.getElementById('access-code-error');

// --- Vue Dashboard ---
export const dashboardBackBtn = document.getElementById('dashboard-back-btn');
export const dashboardProjectTitle = document.getElementById('dashboard-project-title');
export const dashboardStatsKpi = document.getElementById('dashboard-stats-kpi');
export const dashboardStatsWorkload = document.getElementById('dashboard-stats-workload');