// Fichier: src/js/modules/dashboard.js
// Gère la logique pour le tableau de bord analytique.

import { state } from '../core/state.js';
import * as dom from '../core/dom.js';
import { createUserAvatar } from '../utils.js';

// --- INITIALISATION ---

export function initDashboardListeners() {
    dom.showDashboardBtn.addEventListener('click', showDashboard);
    dom.dashboardBackBtn.addEventListener('click', hideDashboard);
}

// --- GESTION DE LA VUE ---

function showDashboard() {
    dom.kanbanView.classList.add('hidden');
    dom.dashboardView.classList.remove('hidden');
    renderDashboard();
}

function hideDashboard() {
    dom.dashboardView.classList.add('hidden');
    dom.kanbanView.classList.remove('hidden');
}

// --- LOGIQUE DE CALCUL ---

/**
 * Calcule toutes les statistiques pour le projet en cours.
 * @param {Array} tasks - state.allTasks
 * @param {Array} users - state.allUsers
 * @returns {object} Un objet contenant toutes les statistiques calculées.
 */
function calculateStats(tasks, users) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done');
    const tasksWithCompletionTime = completedTasks.filter(t => t.completedAt && t.createdAt);

    // 1. Temps de complétion moyen
    let avgCompletionTime = "N/A";
    if (tasksWithCompletionTime.length > 0) {
        const totalDurationMs = tasksWithCompletionTime.reduce((sum, task) => {
            const duration = task.completedAt.toMillis() - task.createdAt.toMillis();
            return sum + duration;
        }, 0);
        const avgMs = totalDurationMs / tasksWithCompletionTime.length;
        avgCompletionTime = formatMillisToDuration(avgMs);
    }

    // 2. Charge de travail par personne (basée sur l'assignation)
    const workload = users.map(user => {
        const assignedTasks = tasks.filter(t => t.assigneeId === user.uid);
        const todo = assignedTasks.filter(t => t.status === 'To Do').length;
        const inProgress = assignedTasks.filter(t => t.status === 'In Progress').length;
        return {
            user,
            total: assignedTasks.length,
            todo,
            inProgress,
        };
    }).filter(u => u.total > 0) // Ne montre que les utilisateurs avec des tâches assignées
      .sort((a, b) => b.total - a.total); // Trie par total

    return {
        totalTasks,
        totalCompleted: completedTasks.length,
        avgCompletionTime,
        workload,
    };
}

/**
 * Convertit des millisecondes en une chaîne lisible (ex: "2.5 jours").
 * @param {number} ms - Millisecondes
 * @returns {string}
 */
function formatMillisToDuration(ms) {
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;

    if (days > 1) return `${days.toFixed(1)} jours`;
    if (hours > 1) return `${hours.toFixed(1)} heures`;
    if (minutes > 1) return `${minutes.toFixed(1)} minutes`;
    return `${seconds.toFixed(0)} secondes`;
}


// --- RENDU HTML ---

/**
 * Affiche les statistiques calculées dans le DOM.
 */
function renderDashboard() {
    const stats = calculateStats(state.allTasks, state.allUsers);
    
    // Titre du projet
    const project = state.allProjects.find(p => p.id === state.currentProjectId);
    dom.dashboardProjectTitle.textContent = project ? project.name : 'Dashboard';

    // 1. Affiche les KPIs
    dom.dashboardStatsKpi.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-gray-500 mb-1">Tâches Totales</h4>
            <p class="text-3xl font-bold text-gray-900">${stats.totalTasks}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-gray-500 mb-1">Tâches Complétées</h4>
            <p class="text-3xl font-bold text-gray-900">${stats.totalCompleted}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-gray-500 mb-1">Temps de Complétion Moyen</h4>
            <p class="text-3xl font-bold text-gray-900">${stats.avgCompletionTime}</p>
        </div>
    `;

    // 2. Affiche la charge de travail
    if (stats.workload.length === 0) {
        dom.dashboardStatsWorkload.innerHTML = `<p class="text-gray-500">Aucune tâche n'est assignée pour ce projet.</p>`;
    } else {
        dom.dashboardStatsWorkload.innerHTML = stats.workload.map(item => `
            <div class="flex items-center justify-between p-4 rounded-md border hover:bg-gray-50">
                <div class="flex items-center gap-3">
                    ${createUserAvatar(item.user, 'h-10 w-10')}
                    <div>
                        <p class="font-semibold text-gray-800">${item.user.displayName}</p>
                        <p class="text-sm text-gray-500">Total: ${item.total}</p>
                    </div>
                </div>
                <div class="flex gap-4 text-right">
                    <div>
                        <p class="text-lg font-semibold text-blue-600">${item.todo}</p>
                        <p class="text-xs text-gray-500">To Do</p>
                    </div>
                    <div>
                        <p class="text-lg font-semibold text-orange-600">${item.inProgress}</p>
                        <p class="text-xs text-gray-500">In Progress</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}