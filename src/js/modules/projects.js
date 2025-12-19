import { db, collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, arrayUnion } from '../core/firebase.js';
import { state, updateAllProjects, updateCurrentProjectId, updateProjectToAccessId, updateHasProjectsLoaded, updateAllTasks, updateHasTasksLoaded, updateNavigationMode, updateCurrentView } from '../core/state.js';
import { renderSidebar, expandProjectMenu, collapseProjectMenu } from './navigation.js';
import * as dom from '../core/dom.js';
import { showToast, formatRelativeTime, createUserAvatar, setLoading } from '../utils.js';
import { setupFirestoreListener } from './kanban.js';

// Direct DOM references
const pageTitle = document.getElementById('page-title');
const deleteProjectModal = document.getElementById('delete-project-modal');
const cancelDeleteProjectBtn = document.getElementById('cancel-delete-project-btn');
const confirmDeleteProjectBtn = document.getElementById('confirm-delete-project-btn');

let firestoreUnsubscribe = null;
let projectToDeleteId = null;

export function initProjectsListeners() {
    dom.createProjectForm.addEventListener('submit', handleCreateProjectSubmit);
    dom.closeCreateProjectModalBtn.addEventListener('click', closeCreateProjectModal);
    dom.cancelCreateProjectBtn.addEventListener('click', closeCreateProjectModal);

    dom.accessProjectForm.addEventListener('submit', handleAccessProjectSubmit);
    dom.closeAccessProjectModalBtn.addEventListener('click', closeAccessProjectModal);
    dom.cancelAccessProjectBtn.addEventListener('click', closeAccessProjectModal);

    cancelDeleteProjectBtn.addEventListener('click', closeDeleteProjectModal);
    confirmDeleteProjectBtn.addEventListener('click', handleDeleteProject);

    dom.headerTitleLink.addEventListener('click', handleBackToProjects);
    dom.backToProjectsBtn.addEventListener('click', handleBackToProjects);
}

export function setupProjectsListener(onLoadedCallback) {
    if (!state.currentUser) return null;

    const projectsCollectionPath = "/artifacts/mini-jira-kanban-board/public/data/projects";
    console.log(`Listening to Firestore at: ${projectsCollectionPath}`);
    const q = query(collection(db, projectsCollectionPath), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        updateAllProjects(projects);

        updateHasProjectsLoaded(true);

        if (onLoadedCallback) onLoadedCallback();

    }, (error) => {
        console.error("Projects listener error:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les projets." });

        updateHasProjectsLoaded(true);

        if (onLoadedCallback) onLoadedCallback();
    });
    return unsubscribe;
}

export function renderCurrentView() {
    if (state.currentProjectId) {
        document.getElementById('home-view')?.classList.add('hidden');
        document.getElementById('profile-view')?.classList.add('hidden');
        dom.projectsView.classList.add('hidden');
        if (dom.dashboardView.classList.contains('hidden')) {
            dom.kanbanView.classList.remove('hidden');
        }
        
        // Show kanban-specific buttons
        if (dom.addTaskBtn) dom.addTaskBtn.classList.remove('hidden');
        if (dom.showDashboardBtn) dom.showDashboardBtn.classList.remove('hidden');
        if (dom.createProjectBtn) dom.createProjectBtn.classList.add('hidden');

        const project = state.allProjects.find(p => p.id === state.currentProjectId);
        const title = project ? project.name : 'Board';
        if (pageTitle) pageTitle.textContent = title;
        if (dom.dashboardProjectTitle) dom.dashboardProjectTitle.textContent = title;

        if (firestoreUnsubscribe) firestoreUnsubscribe();
        firestoreUnsubscribe = setupFirestoreListener();

    } else {
        // Show home view by default
        const homeView = document.getElementById('home-view');
        if (homeView && state.currentView === 'home') {
            homeView.classList.remove('hidden');
            dom.projectsView.classList.add('hidden');
            // Render home view content
            import('./navigation.js').then(module => {
                if (module.renderHomeViewContent) module.renderHomeViewContent();
            });
        } else if (state.currentView === 'projects') {
            homeView?.classList.add('hidden');
            dom.projectsView.classList.remove('hidden');
            renderProjectsList();
        }
        
        dom.kanbanView.classList.add('hidden');
        dom.dashboardView.classList.add('hidden');

        if (firestoreUnsubscribe) firestoreUnsubscribe();
        updateAllTasks([]);
        updateHasTasksLoaded(false);
    }
}

export function renderProjectsListContent() {
    renderProjectsList();
}

function renderProjectsList() {
    const actionBar = document.getElementById('projects-action-bar');
    
    if (actionBar && state.currentUser) {
        actionBar.innerHTML = `
            <button id="create-project-btn" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 shadow-sm transition-colors">
                <i data-lucide="plus" class="w-4 h-4"></i>
                Créer un projet
            </button>
        `;
        
        const createBtn = document.getElementById('create-project-btn');
        if (createBtn) {
            createBtn.addEventListener('click', openCreateProjectModal);
        }
    } else if (actionBar) {
        actionBar.innerHTML = '';
    }
    
    // Calculate statistics
    const totalProjects = state.allProjects.length;
    const myProjects = state.currentUser ? state.allProjects.filter(p => p.createdById === state.currentUser.uid).length : 0;
    const sharedProjects = state.currentUser ? state.allProjects.filter(p => p.members?.includes(state.currentUser.uid) && p.createdById !== state.currentUser.uid).length : 0;
    
    // Render statistics summary
    const statsHTML = `
        <div class="flex items-center gap-3 text-sm text-slate-500 mb-6 px-6">
            <span>Total : <strong class="text-slate-700">${totalProjects}</strong></span>
            <span>•</span>
            <span>Créés : <strong class="text-slate-700">${myProjects}</strong></span>
            <span>•</span>
            <span>Membre : <strong class="text-slate-700">${sharedProjects}</strong></span>
        </div>
    `;
    
    // Insert stats before the projects list
    const projectsContainer = dom.projectsList.parentElement;
    let statsContainer = projectsContainer.querySelector('.projects-stats');
    if (!statsContainer) {
        statsContainer = document.createElement('div');
        statsContainer.className = 'projects-stats';
        projectsContainer.insertBefore(statsContainer, dom.projectsList);
    }
    statsContainer.innerHTML = statsHTML;
    
    if (state.allProjects.length === 0) {
        dom.projectsList.innerHTML = `<p class="text-gray-500 col-span-full">Vous n'avez pas encore de projets. Créez-en un pour commencer !</p>`;
    } else {
        dom.projectsList.innerHTML = state.allProjects.map(createProjectCardHTML).join('');
        dom.projectsList.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.delete-project-btn')) return;
                const projectId = e.currentTarget.dataset.projectId;
                handleProjectCardClick(projectId);
            });
        });
        dom.projectsList.querySelectorAll('.delete-project-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectId = e.currentTarget.dataset.projectId;
                openDeleteProjectModal(projectId);
            });
        });
    }
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}

function createProjectCardHTML(project) {
    const creator = state.allUsers.find(u => u.uid === project.createdById);
    const creatorName = creator ? creator.displayName : (project.createdByUsername || 'Unknown');
    const dateString = formatRelativeTime(project.createdAt);
    const projectKey = `PRJ-${project.id.substring(0, 2).toUpperCase()}`;
    const isCreator = state.currentUser && state.currentUser.uid === project.createdById;

    return `
        <div class="project-card bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md cursor-pointer transition-all" data-project-id="${project.id}">
            <div class="p-4">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <i data-lucide="folder" class="w-4 h-4 text-blue-600"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-semibold text-gray-900">${project.name}</h4>
                            <p class="text-xs text-gray-500">Projet logiciel</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">${projectKey}</span>
                        ${isCreator ? `
                            <button class="delete-project-btn p-1 text-gray-400 hover:text-red-600 transition-colors" data-project-id="${project.id}" title="Supprimer le projet">
                                <i data-lucide="trash-2" class="w-4 h-4"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
                <p class="text-xs text-gray-600 mb-4 line-clamp-2">
                    ${project.description || 'Aucune description fournie.'}
                </p>
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        ${createUserAvatar(creator || { displayName: creatorName }, 'h-5 w-5')}
                        <span class="text-xs text-gray-600">${creatorName}</span>
                    </div>
                    <span class="text-xs text-gray-400">${dateString}</span>
                </div>
            </div>
        </div>
    `;
}

function openCreateProjectModal() {
    dom.createProjectForm.reset();
    dom.projectNameError.classList.add('hidden');
    dom.projectCodeError.classList.add('hidden');
    dom.createProjectModal.showModal();
}

function closeCreateProjectModal() { dom.createProjectModal.close(); }

function openAccessProjectModal(projectId) {
    updateProjectToAccessId(projectId);
    dom.accessProjectForm.reset();
    dom.accessCodeError.classList.add('hidden');
    dom.accessProjectModal.showModal();
}

function closeAccessProjectModal() {
    updateProjectToAccessId(null);
    dom.accessProjectModal.close();
}

function handleProjectCardClick(projectId) {
    openAccessProjectModal(projectId);
}

function validateProjectForm() {
    let isValid = true;
    const name = dom.createProjectForm.name.value;
    const code = dom.createProjectForm.accessCode.value;
    
    if (name.length < 3) {
        dom.projectNameError.classList.remove('hidden');
        isValid = false;
    } else {
        dom.projectNameError.classList.add('hidden');
    }
    
    if (code.length < 4) {
        dom.projectCodeError.classList.remove('hidden');
        isValid = false;
    } else {
        dom.projectCodeError.classList.add('hidden');
    }
    return isValid;
}

async function handleCreateProjectSubmit(e) {
    e.preventDefault();
    if (!validateProjectForm() || !state.currentUser) return;

    dom.saveProjectBtn.disabled = true;
    
    const deadlineValue = dom.createProjectForm.deadline.value;
    const deadlineDate = deadlineValue ? new Date(deadlineValue + 'T23:59:59') : null;
    
    const projectData = {
        name: dom.createProjectForm.name.value,
        description: dom.createProjectForm.description.value,
        accessCode: dom.createProjectForm.accessCode.value,
        deadline: deadlineDate ? Timestamp.fromDate(deadlineDate) : null,
        createdById: state.currentUser.uid,
        createdByUsername: state.currentUser.displayName || `User-${state.currentUser.uid.substring(0, 6)}`,
        createdAt: Timestamp.now(),
        members: [state.currentUser.uid]
    };

    try {
        const projectsCollectionPath = "/artifacts/mini-jira-kanban-board/public/data/projects";
        await addDoc(collection(db, projectsCollectionPath), projectData);
        showToast({ title: "Succès", description: "Projet créé avec succès." });
        closeCreateProjectModal();
    } catch (error) {
        console.error("Error creating project:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de créer le projet." });
    } finally {
        dom.saveProjectBtn.disabled = false;
    }
}

async function handleAccessProjectSubmit(e) {
    e.preventDefault();
    if (!state.projectToAccessId) return;

    const inputCode = dom.accessProjectForm.accessCode.value;
    const project = state.allProjects.find(p => p.id === state.projectToAccessId);
    
    if (project && project.accessCode === inputCode) {
        dom.accessCodeError.classList.add('hidden');
        
        // Add user to project members if not already a member
        if (!project.members || !project.members.includes(state.currentUser.uid)) {
            try {
                const projectsCollectionPath = "/artifacts/mini-jira-kanban-board/public/data/projects";
                const projectDoc = doc(db, projectsCollectionPath, state.projectToAccessId);
                await updateDoc(projectDoc, {
                    members: arrayUnion(state.currentUser.uid)
                });
            } catch (error) {
                console.error("Error adding user to project:", error);
            }
        }
        
        // Expand project submenu and switch to summary (default view)
        updateNavigationMode('project');
        updateCurrentProjectId(state.projectToAccessId);
        updateCurrentView('summary');
        expandProjectMenu();
        
        // Set active state for summary in sidebar
        import('./navigation.js').then(module => {
            if (module.setActiveSubmenuItem) module.setActiveSubmenuItem('summary');
        });
        
        closeAccessProjectModal();
        setLoading(true); 
        renderCurrentView(); 
    } else {
        dom.accessCodeError.classList.remove('hidden');
    }
}


function handleBackToProjects() {
    updateNavigationMode('global');
    updateCurrentProjectId(null);
    updateCurrentView('projects');
    collapseProjectMenu();
    renderCurrentView();
}

function openDeleteProjectModal(projectId) {
    projectToDeleteId = projectId;
    deleteProjectModal.showModal();
}

function closeDeleteProjectModal() {
    projectToDeleteId = null;
    deleteProjectModal.close();
}

async function handleDeleteProject() {
    if (!projectToDeleteId) return;

    const project = state.allProjects.find(p => p.id === projectToDeleteId);
    if (!project || project.createdById !== state.currentUser.uid) {
        showToast({ variant: "destructive", title: "Erreur", description: "Vous n'avez pas la permission de supprimer ce projet." });
        closeDeleteProjectModal();
        return;
    }

    confirmDeleteProjectBtn.disabled = true;

    try {
        const projectsCollectionPath = "/artifacts/mini-jira-kanban-board/public/data/projects";
        await deleteDoc(doc(db, projectsCollectionPath, projectToDeleteId));
        
        showToast({ title: "Succès", description: "Projet supprimé avec succès." });
        closeDeleteProjectModal();
        
        if (state.currentProjectId === projectToDeleteId) {
            updateCurrentProjectId(null);
            renderCurrentView();
        }
    } catch (error) {
        console.error("Error deleting project:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer le projet." });
    } finally {
        confirmDeleteProjectBtn.disabled = false;
    }
}