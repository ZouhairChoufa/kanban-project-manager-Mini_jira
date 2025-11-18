// Fichier: src/js/core/state.js
// Gère l'état global de l'application.

export const STATUSES = ["To Do", "In Progress", "Done"];

// L'état global unique
export const state = {
    currentUser: null,
    allProjects: [],
    allTasks: [],
    allUsers: [],
    currentProjectId: null,
    projectToAccessId: null,
    draggedTaskId: null,
    taskToDeleteId: null,
    isSubmitting: false,
    
    // Statut de chargement
    hasTasksLoaded: false,
    hasUsersLoaded: false,
    hasProjectsLoaded: false,
};

// Fonctions "Mutator" pour mettre à jour l'état
export function updateCurrentUser(user) {
    state.currentUser = user;
}
export function updateAllProjects(projects) {
    state.allProjects = projects;
}
export function updateAllTasks(tasks) {
    state.allTasks = tasks;
}
export function updateAllUsers(users) {
    state.allUsers = users;
}
export function updateCurrentProjectId(projectId) {
    state.currentProjectId = projectId;
}
export function updateProjectToAccessId(projectId) {
    state.projectToAccessId = projectId;
}
export function updateDraggedTaskId(taskId) {
    state.draggedTaskId = taskId;
}
export function updateTaskToDeleteId(taskId) {
    state.taskToDeleteId = taskId;
}
export function updateIsSubmitting(submitting) {
    state.isSubmitting = submitting;
}
export function updateHasTasksLoaded(loaded) {
    state.hasTasksLoaded = loaded;
}
export function updateHasUsersLoaded(loaded) {
    state.hasUsersLoaded = loaded;
}
export function updateHasProjectsLoaded(loaded) {
    state.hasProjectsLoaded = loaded;
}