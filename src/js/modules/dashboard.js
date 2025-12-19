import { state } from '../core/state.js';
import * as dom from '../core/dom.js';
import { createUserAvatar } from '../utils.js';

// Import pageTitle separately since it might not be in dom.js yet
const pageTitle = document.getElementById('page-title');

let statusChart = null;
let workloadChart = null;

export function initDashboardListeners() {
    if (dom.showDashboardBtn) {
        dom.showDashboardBtn.addEventListener('click', showDashboard);
    }
    if (dom.dashboardBackBtn) {
        dom.dashboardBackBtn.addEventListener('click', hideDashboard);
    }
}

function showDashboard() {
    dom.kanbanView.classList.add('hidden');
    dom.dashboardView.classList.remove('hidden');
    if (pageTitle) pageTitle.textContent = 'Analytics';
    renderDashboard();
}

function hideDashboard() {
    dom.dashboardView.classList.add('hidden');
    dom.kanbanView.classList.remove('hidden');
    const project = state.allProjects.find(p => p.id === state.currentProjectId);
    const title = project ? project.name : 'Board';
    if (pageTitle) pageTitle.textContent = title;
    destroyCharts();
}

function destroyCharts() {
    if (statusChart) {
        statusChart.destroy();
        statusChart = null;
    }
    if (workloadChart) {
        workloadChart.destroy();
        workloadChart = null;
    }
}

function calculateStats(tasks, users) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Done');
    const tasksWithCompletionTime = completedTasks.filter(t => t.completedAt && t.createdAt);

    let avgCompletionTime = "N/A";
    if (tasksWithCompletionTime.length > 0) {
        const totalDurationMs = tasksWithCompletionTime.reduce((sum, task) => {
            const duration = task.completedAt.toMillis() - task.createdAt.toMillis();
            return sum + duration;
        }, 0);
        const avgMs = totalDurationMs / tasksWithCompletionTime.length;
        avgCompletionTime = formatMillisToDuration(avgMs);
    }

    const accuracy = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    const todoTasks = tasks.filter(t => t.status === 'To Do');
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
    const doneTasks = completedTasks;

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
    }).filter(u => u.total > 0)
      .sort((a, b) => b.total - a.total);

    return {
        totalTasks,
        totalCompleted: completedTasks.length,
        avgCompletionTime,
        accuracy,
        todoTasks,
        inProgressTasks,
        doneTasks,
        workload,
    };
}

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

function renderDashboard() {
    const stats = calculateStats(state.allTasks, state.allUsers);
    
    const project = state.allProjects.find(p => p.id === state.currentProjectId);
    dom.dashboardProjectTitle.textContent = project ? project.name : 'Dashboard';

    // Render KPIs
    dom.dashboardStatsKpi.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">Total Tasks</h4>
            <p class="text-3xl font-bold text-slate-900">${stats.totalTasks}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">Completed</h4>
            <p class="text-3xl font-bold text-slate-900">${stats.totalCompleted}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">In Progress</h4>
            <p class="text-3xl font-bold text-slate-900">${stats.inProgressTasks.length}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">Completion Rate</h4>
            <p class="text-3xl font-bold text-slate-900">${stats.accuracy}%</p>
        </div>
    `;
    
    // Render Charts
    renderStatusChart(stats);
    renderWorkloadChart(stats);

    // Render workload list
    if (stats.workload.length === 0) {
        dom.dashboardStatsWorkload.innerHTML = `<p class="text-slate-500">No tasks assigned for this project.</p>`;
    } else {
        dom.dashboardStatsWorkload.innerHTML = stats.workload.map(item => `
            <div class="flex items-center justify-between p-4 rounded-md border hover:bg-slate-50">
                <div class="flex items-center gap-3">
                    ${createUserAvatar(item.user, 'h-10 w-10')}
                    <div>
                        <p class="font-semibold text-slate-800">${item.user.displayName}</p>
                        <p class="text-sm text-slate-500">Total: ${item.total}</p>
                    </div>
                </div>
                <div class="flex gap-4 text-right">
                    <div>
                        <p class="text-lg font-semibold text-blue-600">${item.todo}</p>
                        <p class="text-xs text-slate-500">To Do</p>
                    </div>
                    <div>
                        <p class="text-lg font-semibold text-orange-600">${item.inProgress}</p>
                        <p class="text-xs text-slate-500">In Progress</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function renderStatusChart(stats) {
    destroyCharts();
    
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['To Do', 'In Progress', 'Done'],
            datasets: [{
                data: [
                    stats.todoTasks.length,
                    stats.inProgressTasks.length,
                    stats.doneTasks.length
                ],
                backgroundColor: [
                    'rgb(59 130 246)', // blue-500
                    'rgb(249 115 22)', // orange-500
                    'rgb(34 197 94)'   // green-500
                ],
                borderWidth: 0,
                cutout: '60%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function renderWorkloadChart(stats) {
    const ctx = document.getElementById('workloadChart');
    if (!ctx || stats.workload.length === 0) return;
    
    const labels = stats.workload.map(item => item.user.displayName);
    const data = stats.workload.map(item => item.total);
    
    workloadChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tasks Assigned',
                data: data,
                backgroundColor: 'rgb(79 70 229)', // indigo-600
                borderRadius: 4,
                maxBarThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}