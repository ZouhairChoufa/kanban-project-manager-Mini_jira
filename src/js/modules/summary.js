import { state } from '../core/state.js';
import { createUserAvatar, formatRelativeTime } from '../utils.js';

export function renderSummaryView() {
    const summaryView = document.getElementById('summary-view');
    const project = state.allProjects.find(p => p.id === state.currentProjectId);
    
    if (!project) return;
    
    document.getElementById('summary-project-title').textContent = project.name;
    document.getElementById('summary-project-description').textContent = project.description || 'Aucune description';
    
    // Stats
    const projectTasks = state.allTasks;
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'Done' || t.status === 'done').length;
    
    let daysRemainingText = 'N/A';
    let daysRemainingColor = 'text-slate-900';
    
    if (project.deadline) {
        const deadlineDate = project.deadline.toDate();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);
        
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            daysRemainingText = 'En retard';
            daysRemainingColor = 'text-red-600';
        } else if (diffDays === 0) {
            daysRemainingText = 'Aujourd\'hui';
            daysRemainingColor = 'text-orange-600';
        } else {
            daysRemainingText = `${diffDays} jours`;
            daysRemainingColor = 'text-indigo-600';
        }
    }
    
    document.getElementById('summary-stats').innerHTML = `
        <div class="bg-white p-6 rounded-lg border border-slate-200">
            <div class="text-3xl font-bold text-slate-900">${totalTasks}</div>
            <div class="text-sm text-slate-500 mt-1">Total des tâches</div>
        </div>
        <div class="bg-white p-6 rounded-lg border border-slate-200">
            <div class="text-3xl font-bold text-green-600">${completedTasks}</div>
            <div class="text-sm text-slate-500 mt-1">Terminées</div>
        </div>
        <div class="bg-white p-6 rounded-lg border border-slate-200">
            <div class="text-3xl font-bold ${daysRemainingColor}">${daysRemainingText}</div>
            <div class="text-sm text-slate-500 mt-1">Jours restants</div>
        </div>
    `;
    
    // Team
    const members = project.members || [];
    const owner = state.allUsers.find(u => u.uid === project.createdById);
    const memberUsers = state.allUsers.filter(u => members.includes(u.uid));
    
    document.getElementById('summary-team').innerHTML = `
        <div class="bg-white p-6 rounded-lg border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Équipe</h3>
            <div class="space-y-3">
                ${owner ? `
                    <div class="flex items-center gap-3">
                        ${createUserAvatar(owner, 'h-10 w-10')}
                        <div>
                            <div class="text-sm font-medium text-slate-900">${owner.displayName}</div>
                            <div class="text-xs text-slate-500">Propriétaire</div>
                        </div>
                    </div>
                ` : ''}
                ${memberUsers.filter(u => u.uid !== project.createdById).map(user => `
                    <div class="flex items-center gap-3">
                        ${createUserAvatar(user, 'h-10 w-10')}
                        <div>
                            <div class="text-sm font-medium text-slate-900">${user.displayName}</div>
                            <div class="text-xs text-slate-500">Membre</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Recent Activity
    const recentTasks = projectTasks
        .sort((a, b) => {
            const dateA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const dateB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return dateB - dateA;
        })
        .slice(0, 5);
    document.getElementById('summary-activity').innerHTML = `
        <div class="bg-white p-6 rounded-lg border border-slate-200">
            <h3 class="text-lg font-semibold text-slate-900 mb-4">Activité récente</h3>
            <div class="space-y-3">
                ${recentTasks.length > 0 ? recentTasks.map(task => {
                    const assignee = state.allUsers.find(u => u.uid === task.assigneeId);
                    const statusColor = task.status === 'Done' ? 'green' : task.status === 'In Progress' ? 'orange' : 'blue';
                    return `
                        <div class="flex items-center gap-3 text-sm">
                            <i data-lucide="circle" class="w-4 h-4 text-${statusColor}-500"></i>
                            <span class="flex-1 text-slate-700">${task.title}</span>
                            ${assignee ? createUserAvatar(assignee, 'h-6 w-6') : ''}
                        </div>
                    `;
                }).join('') : '<p class="text-sm text-slate-500">Aucune activité récente</p>'}
            </div>
        </div>
    `;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
