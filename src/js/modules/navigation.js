import { state, updateNavigationMode, updateCurrentView, updateCurrentProjectId } from '../core/state.js';
import * as dom from '../core/dom.js';
import { createUserAvatar, formatRelativeTime } from '../utils.js';
import { renderSummaryView } from './summary.js';
import { renderCurrentView } from './projects.js';

let statusChart = null;
let workloadChart = null;

export function initSidebarNavigation() {
    // Will be initialized dynamically
}

export function renderSidebar(mode) {
    // Sidebar is now static in HTML, just attach listeners
    attachNavListeners();
    
    // Re-render icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}

export function expandProjectMenu() {
    const submenu = document.getElementById('project-submenu');
    if (submenu) {
        submenu.classList.remove('hidden');
        submenu.classList.add('flex');
    }
}

export function collapseProjectMenu() {
    const submenu = document.getElementById('project-submenu');
    if (submenu) {
        submenu.classList.add('hidden');
        submenu.classList.remove('flex');
    }
    
    // Reset submenu items to default state
    const submenuItems = submenu?.querySelectorAll('a');
    submenuItems?.forEach(item => {
        item.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-semibold');
        item.classList.add('text-slate-600');
    });
}

function attachNavListeners() {
    const navHome = document.getElementById('nav-home');
    const navProjects = document.getElementById('nav-projects');
    const navProfile = document.getElementById('nav-profile');
    const navSummary = document.getElementById('nav-summary');
    const navBoard = document.getElementById('nav-board');
    const navCalendar = document.getElementById('nav-calendar');
    const navReports = document.getElementById('nav-reports');
    
    // Main nav items
    [navHome, navProjects, navProfile].forEach(item => {
        if (!item) return;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            
            if (!state.currentUser && (view === 'projects' || view === 'profile')) {
                document.getElementById('app-container').classList.add('hidden');
                document.getElementById('auth-container').classList.remove('hidden');
                setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 50);
                return;
            }
            
            // Collapse submenu if leaving projects
            if (view !== 'projects' && state.currentProjectId) {
                collapseProjectMenu();
                updateCurrentProjectId(null);
            }
            
            // Update active state for main items
            [navHome, navProjects, navProfile].forEach(nav => {
                nav?.classList.remove('bg-blue-50', 'text-blue-700', 'font-medium');
                nav?.classList.add('text-gray-600');
            });
            e.currentTarget.classList.remove('text-gray-600');
            e.currentTarget.classList.add('bg-blue-50', 'text-blue-700', 'font-medium');
            
            updateCurrentView(view);
            showView(view);
        });
    });
    
    // Submenu items
    [navSummary, navBoard, navCalendar, navReports].forEach(item => {
        if (!item) return;
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const view = e.currentTarget.dataset.view;
            
            setActiveSubmenuItem(view);
            updateCurrentView(view);
            showView(view);
        });
    });
}

export function setActiveSubmenuItem(view) {
    const navSummary = document.getElementById('nav-summary');
    const navBoard = document.getElementById('nav-board');
    const navCalendar = document.getElementById('nav-calendar');
    const navReports = document.getElementById('nav-reports');
    
    // Remove active state from all submenu items
    [navSummary, navBoard, navCalendar, navReports].forEach(nav => {
        nav?.classList.remove('bg-indigo-50', 'text-indigo-700', 'font-semibold');
        nav?.classList.add('text-slate-600');
    });
    
    // Set active state for current view
    const activeItem = document.getElementById(`nav-${view}`);
    if (activeItem) {
        activeItem.classList.remove('text-slate-600');
        activeItem.classList.add('bg-indigo-50', 'text-indigo-700', 'font-semibold');
    }
}

function showView(view) {
    // Hide all views
    const views = ['projects-view', 'kanban-view', 'summary-view', 'calendar-view', 'reports-view', 'dashboard-view', 'home-view', 'profile-view'];
    views.forEach(v => {
        const element = document.getElementById(v);
        if (element) element.classList.add('hidden');
    });
    
    // Show selected view and render content
    switch(view) {
        case 'home':
            const homeView = document.getElementById('home-view');
            if (homeView) {
                homeView.classList.remove('hidden');
                renderHomeViewContent();
            }
            break;
        case 'projects':
            dom.projectsView?.classList.remove('hidden');
            renderProjectsView();
            break;
        case 'profile':
            const profileView = document.getElementById('profile-view');
            if (profileView) {
                profileView.classList.remove('hidden');
                renderProfileView();
            }
            break;
        case 'summary':
            document.getElementById('summary-view')?.classList.remove('hidden');
            renderSummary();
            break;
        case 'board':
            dom.kanbanView?.classList.remove('hidden');
            break;
        case 'calendar':
            document.getElementById('calendar-view')?.classList.remove('hidden');
            renderCalendar();
            break;
        case 'reports':
            document.getElementById('reports-view')?.classList.remove('hidden');
            renderReports();
            break;
    }
    
    // Re-render icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 100);
}

export function renderHomeViewContent() {
    renderHomeView();
}

function renderProjectsView() {
    import('./projects.js').then(module => {
        if (module.renderProjectsListContent) module.renderProjectsListContent();
    });
}

function renderHomeView() {
    const homeView = document.getElementById('home-view');
    if (!homeView) return;
    
    if (!state.currentUser) {
        // Public landing page
        homeView.innerHTML = `
            <div class="bg-white border-b border-gray-200 px-6 py-4">
                <h1 class="text-2xl font-semibold text-gray-900">Bienvenue sur TaskFlow</h1>
                <p class="text-gray-500 text-sm mt-1">Gestion de projet professionnelle simplifiée</p>
            </div>
            <div class="p-6">
                <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-12 text-white text-center mb-8">
                    <h2 class="text-4xl font-bold mb-4">Gérez vos projets comme un pro</h2>
                    <p class="text-xl text-indigo-100 mb-8">Collaborez avec votre équipe, suivez les tâches et livrez les projets à temps</p>
                    <button onclick="document.getElementById('auth-container').classList.remove('hidden'); document.getElementById('app-container').classList.add('hidden'); setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 50);" class="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold text-lg hover:bg-indigo-50 transition-colors">
                        Commencer
                    </button>
                </div>
                <div class="grid grid-cols-3 gap-6">
                    <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center">
                        <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="kanban-square" class="w-6 h-6 text-indigo-600"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Tableaux Kanban</h3>
                        <p class="text-sm text-gray-600">Visualisez votre flux de travail avec des tableaux intuitifs par glisser-déposer</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center">
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="users" class="w-6 h-6 text-blue-600"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Collaboration d'équipe</h3>
                        <p class="text-sm text-gray-600">Travaillez ensemble de manière transparente avec des mises à jour en temps réel</p>
                    </div>
                    <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center">
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="bar-chart-3" class="w-6 h-6 text-green-600"></i>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">Analytique et rapports</h3>
                        <p class="text-sm text-gray-600">Suivez les progrès et les performances avec des informations détaillées</p>
                    </div>
                </div>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    const totalProjects = state.allProjects.length;
    const myProjects = state.allProjects.filter(p => p.createdById === state.currentUser?.uid).length;
    const totalTasks = state.allProjects.reduce((sum, project) => {
        return sum + state.allTasks.filter(t => t.projectId === project.id).length;
    }, 0);
    
    homeView.innerHTML = `
        <div class="bg-white border-b border-gray-200 px-6 py-4">
            <h1 class="text-2xl font-semibold text-gray-900">Bon retour, ${state.currentUser?.displayName || 'Utilisateur'} !</h1>
            <p class="text-gray-500 text-sm mt-1">Voici ce qui se passe avec vos projets</p>
        </div>
        <div class="p-6">
            <div class="grid grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="folder" class="w-5 h-5 text-indigo-600"></i>
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-gray-900">${totalProjects}</p>
                            <p class="text-sm text-gray-500">Total des projets</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="user" class="w-5 h-5 text-blue-600"></i>
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-gray-900">${myProjects}</p>
                            <p class="text-sm text-gray-500">Mes projets</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-gray-900">${totalTasks}</p>
                            <p class="text-sm text-gray-500">Total des tâches</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-8 text-white">
                <h2 class="text-2xl font-bold mb-2">Prêt à commencer ?</h2>
                <p class="text-indigo-100 mb-4">Créez un nouveau projet ou parcourez ceux existants</p>
                <button id="home-view-projects-btn" class="bg-white text-indigo-600 px-6 py-2 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
                    Voir les projets
                </button>
            </div>
        </div>
    `;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    const viewProjectsBtn = document.getElementById('home-view-projects-btn');
    if (viewProjectsBtn) {
        viewProjectsBtn.addEventListener('click', () => {
            if (state.currentUser) {
                document.querySelector('[data-view="projects"]')?.click();
            } else {
                document.getElementById('global-header-login-btn')?.click();
            }
        });
    }
}

async function renderProfileView() {
    const profileView = document.getElementById('profile-view');
    if (!profileView || !state.currentUser) return;
    
    // Fetch tasks from all projects
    const allUserTasks = [];
    const { db, collection, getDocs } = await import('../core/firebase.js');
    
    for (const project of state.allProjects) {
        try {
            const tasksCollectionPath = `/artifacts/mini-jira-kanban-board/public/data/projects/${project.id}/tasks`;
            const snapshot = await getDocs(collection(db, tasksCollectionPath));
            
            const projectTasks = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data(), projectId: project.id }))
                .filter(task => task.assigneeId === state.currentUser.uid);
            
            allUserTasks.push(...projectTasks);
        } catch (error) {
            console.error(`Error fetching tasks for project ${project.id}:`, error);
        }
    }
    
    const todoCount = allUserTasks.filter(t => t.status === 'To Do').length;
    const inProgressCount = allUserTasks.filter(t => t.status === 'In Progress').length;
    const doneCount = allUserTasks.filter(t => t.status === 'Done' || t.status === 'done').length;
    
    profileView.innerHTML = `
        <div class="bg-white border-b border-gray-200 px-6 py-4">
            <h1 class="text-2xl font-semibold text-gray-900">Profil</h1>
        </div>
        <div class="p-6">
            <div class="bg-white rounded-lg border border-slate-200 p-6 mb-6">
                <div class="flex items-center gap-4 mb-6">
                    ${createUserAvatar(state.currentUser, 'h-20 w-20')}
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">${state.currentUser.displayName || 'User'}</h2>
                        <p class="text-gray-500">${state.currentUser.email}</p>
                        <span class="inline-block mt-2 px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">Administrateur</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg border border-slate-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance des tâches (Tous les projets)</h3>
                <div class="grid grid-cols-3 gap-4 mb-6">
                    <div class="text-center p-4 bg-blue-50 rounded-lg">
                        <p class="text-3xl font-bold text-blue-600">${todoCount}</p>
                        <p class="text-sm text-gray-600 mt-1">To Do</p>
                    </div>
                    <div class="text-center p-4 bg-orange-50 rounded-lg">
                        <p class="text-3xl font-bold text-orange-600">${inProgressCount}</p>
                        <p class="text-sm text-gray-600 mt-1">In Progress</p>
                    </div>
                    <div class="text-center p-4 bg-green-50 rounded-lg">
                        <p class="text-3xl font-bold text-green-600">${doneCount}</p>
                        <p class="text-sm text-gray-600 mt-1">Done</p>
                    </div>
                </div>
                <div class="h-64">
                    <canvas id="profileChart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Render Chart
    setTimeout(() => {
        const ctx = document.getElementById('profileChart');
        if (ctx && typeof Chart !== 'undefined') {
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['To Do', 'In Progress', 'Done'],
                    datasets: [{
                        data: [todoCount, inProgressCount, doneCount],
                        backgroundColor: ['rgb(59 130 246)', 'rgb(249 115 22)', 'rgb(34 197 94)'],
                        borderWidth: 0,
                        cutout: '65%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { padding: 20, usePointStyle: true, font: { size: 14 } }
                        }
                    }
                }
            });
        }
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
}

function renderSummary() {
    renderSummaryView();
}

function renderCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    const monthNamesFr = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    
    document.getElementById('calendar-month').textContent = `${monthNamesFr[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let calendarHTML = `
        <div class="bg-white rounded-lg border border-gray-200 p-4">
            <div class="grid grid-cols-7 gap-2 mb-2">
                ${['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => 
                    `<div class="text-center text-sm font-semibold text-gray-600 py-2">${day}</div>`
                ).join('')}
            </div>
            <div class="grid grid-cols-7 gap-2">
    `;
    
    for (let i = 0; i < firstDay; i++) {
        calendarHTML += '<div class="min-h-24"></div>';
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const tasksOnDay = state.allTasks.filter(task => task.dueDate === dateStr);
        console.log('Checking date:', dateStr, 'Tasks found:', tasksOnDay.length, tasksOnDay);
        
        const statusColors = {
            'Done': 'bg-green-100 text-green-800',
            'In Progress': 'bg-orange-100 text-orange-800',
            'To Do': 'bg-blue-100 text-blue-800'
        };
        
        calendarHTML += `
            <div class="min-h-24 border border-gray-200 rounded p-2 hover:bg-gray-50 transition-colors cursor-pointer" data-date="${dateStr}">
                <div class="text-sm font-medium text-gray-900 mb-1">${day}</div>
                <div class="space-y-1">
                    ${tasksOnDay.slice(0, 3).map(task => {
                        const colorClass = statusColors[task.status] || 'bg-gray-100 text-gray-800';
                        const priorityBorder = task.priority === 'High' ? 'border-l-2 border-red-500' : '';
                        const truncatedTitle = task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title;
                        return `
                            <div class="text-xs truncate px-1 py-0.5 rounded ${colorClass} ${priorityBorder} cursor-pointer hover:opacity-80" 
                                 data-task-id="${task.id}" 
                                 title="${task.title}">
                                ${truncatedTitle}
                            </div>
                        `;
                    }).join('')}
                    ${tasksOnDay.length > 3 ? `<div class="text-xs text-gray-500 px-1">+${tasksOnDay.length - 3} de plus</div>` : ''}
                </div>
            </div>
        `;
    }
    
    calendarHTML += '</div></div>';
    document.getElementById('calendar-grid').innerHTML = calendarHTML;
    
    // Add event listeners
    document.querySelectorAll('[data-task-id]').forEach(pill => {
        pill.addEventListener('click', (e) => {
            e.stopPropagation();
            const taskId = e.currentTarget.dataset.taskId;
            const task = state.allTasks.find(t => t.id === taskId);
            if (task) {
                import('./kanban.js').then(module => {
                    if (module.openTaskModalFromCalendar) module.openTaskModalFromCalendar(task);
                });
            }
        });
    });
    
    document.querySelectorAll('[data-date]').forEach(cell => {
        cell.addEventListener('click', (e) => {
            if (e.target.dataset.taskId) return;
            const date = e.currentTarget.dataset.date;
            import('./kanban.js').then(module => {
                if (module.openTaskModalWithDate) module.openTaskModalWithDate(date);
            });
        });
    });
}

function renderReports() {
    const projectTasks = state.currentProjectId ? state.allTasks : [];
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
    const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress').length;
    const accuracy = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // KPIs
    document.getElementById('reports-stats-kpi').innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">Total des tâches</h4>
            <p class="text-3xl font-bold text-slate-900">${totalTasks}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">Terminées</h4>
            <p class="text-3xl font-bold text-slate-900">${completedTasks}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">En cours</h4>
            <p class="text-3xl font-bold text-slate-900">${inProgressTasks}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow-sm border">
            <h4 class="text-sm font-medium text-slate-500 mb-1">Taux de réalisation</h4>
            <p class="text-3xl font-bold text-slate-900">${accuracy}%</p>
        </div>
    `;
    
    // Charts
    renderReportsCharts();
    
    // Workload
    const project = state.allProjects.find(p => p.id === state.currentProjectId);
    const projectMembers = project?.members || [];
    const workload = state.allUsers
        .filter(user => projectMembers.includes(user.uid))
        .map(user => {
            const assignedTasks = projectTasks.filter(t => t.assigneeId === user.uid);
            return {
                user,
                total: assignedTasks.length,
                todo: assignedTasks.filter(t => t.status === 'To Do').length,
                inProgress: assignedTasks.filter(t => t.status === 'In Progress').length
            };
        })
        .filter(u => u.total > 0)
        .sort((a, b) => b.total - a.total);
    
    const workloadHTML = workload.length > 0 ? workload.map(item => `
        <div class="flex items-center justify-between p-4 rounded-md border hover:bg-slate-50">
            <div class="flex items-center gap-3">
                ${createUserAvatar(item.user, 'h-10 w-10')}
                <div>
                    <p class="font-semibold text-slate-800">${item.user.displayName}</p>
                    <p class="text-sm text-slate-500">Total : ${item.total}</p>
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
    `).join('') : '<p class="text-slate-500 text-center py-8">Aucune tâche assignée pour le moment</p>';
    
    document.getElementById('reports-workload').innerHTML = `
        <div>
            <h3 class="text-xl font-bold tracking-tight mb-4">Charge de travail par membre de l'équipe</h3>
            <div class="space-y-4">${workloadHTML}</div>
        </div>
    `;
}

function renderReportsCharts() {
    if (statusChart) {
        try { statusChart.destroy(); } catch(e) {}
    }
    if (workloadChart) {
        try { workloadChart.destroy(); } catch(e) {}
    }
    
    const projectTasks = state.currentProjectId ? state.allTasks : [];
    const todoTasks = projectTasks.filter(t => t.status === 'To Do');
    const inProgressTasks = projectTasks.filter(t => t.status === 'In Progress');
    const doneTasks = projectTasks.filter(t => t.status === 'Done');
    
    // Status Chart
    const statusCtx = document.getElementById('reportsStatusChart');
    if (statusCtx && typeof Chart !== 'undefined') {
        statusChart = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['To Do', 'In Progress', 'Done'],
                datasets: [{
                    data: [todoTasks.length, inProgressTasks.length, doneTasks.length],
                    backgroundColor: ['rgb(59 130 246)', 'rgb(249 115 22)', 'rgb(34 197 94)'],
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
                        labels: { padding: 20, usePointStyle: true, font: { size: 12 } }
                    }
                }
            }
        });
    }
    
    // Workload Chart
    const project = state.allProjects.find(p => p.id === state.currentProjectId);
    const projectMembers = project?.members || [];
    const workloadData = state.allUsers
        .filter(user => projectMembers.includes(user.uid))
        .map(user => ({
            name: user.displayName,
            total: projectTasks.filter(t => t.assigneeId === user.uid).length
        }))
        .filter(u => u.total > 0);
    
    const workloadCtx = document.getElementById('reportsWorkloadChart');
    if (workloadCtx && workloadData.length > 0 && typeof Chart !== 'undefined') {
        workloadChart = new Chart(workloadCtx, {
            type: 'bar',
            data: {
                labels: workloadData.map(u => u.name),
                datasets: [{
                    label: 'Tasks Assigned',
                    data: workloadData.map(u => u.total),
                    backgroundColor: 'rgb(79 70 229)',
                    borderRadius: 4,
                    maxBarThickness: 60
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { ticks: { maxRotation: 45 } }
                }
            }
        });
    }
}
