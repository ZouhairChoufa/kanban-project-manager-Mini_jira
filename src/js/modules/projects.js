import { db, collection, query, orderBy, onSnapshot, addDoc, Timestamp } from '../core/firebase.js';
import { state, updateAllProjects, updateCurrentProjectId, updateProjectToAccessId, updateHasProjectsLoaded, updateAllTasks, updateHasTasksLoaded } from '../core/state.js';
import * as dom from '../core/dom.js';
import { showToast, formatRelativeTime, createUserAvatar, setLoading } from '../utils.js';
import { setupFirestoreListener } from './kanban.js';

let firestoreUnsubscribe = null;

export function initProjectsListeners() {
    dom.createProjectBtn.addEventListener('click', openCreateProjectModal);
    dom.createProjectForm.addEventListener('submit', handleCreateProjectSubmit);
    dom.closeCreateProjectModalBtn.addEventListener('click', closeCreateProjectModal);
    dom.cancelCreateProjectBtn.addEventListener('click', closeCreateProjectModal);

    dom.accessProjectForm.addEventListener('submit', handleAccessProjectSubmit);
    dom.closeAccessProjectModalBtn.addEventListener('click', closeAccessProjectModal);
    dom.cancelAccessProjectBtn.addEventListener('click', closeAccessProjectModal);

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
        dom.projectsView.classList.add('hidden');
        if (dom.dashboardView.classList.contains('hidden')) {
            dom.kanbanView.classList.remove('hidden');
        }

        const project = state.allProjects.find(p => p.id === state.currentProjectId);
        const title = project ? project.name : 'Kanban Board';
        dom.kanbanProjectTitle.textContent = title;
        dom.dashboardProjectTitle.textContent = title;

        if (firestoreUnsubscribe) firestoreUnsubscribe();
        firestoreUnsubscribe = setupFirestoreListener();

    } else {
        dom.projectsView.classList.remove('hidden');
        dom.kanbanView.classList.add('hidden');
        dom.dashboardView.classList.add('hidden');

        if (firestoreUnsubscribe) firestoreUnsubscribe();
        updateAllTasks([]);
        updateHasTasksLoaded(false);

        renderProjectsList();
    }
}

function renderProjectsList() {
    if (!dom.projectsView.classList.contains('hidden')) {
        if (state.allProjects.length === 0) {
            dom.projectsList.innerHTML = `<p class="text-gray-500 col-span-full">Vous n'avez pas encore de projets. Créez-en un pour commencer !</p>`;
        } else {
            dom.projectsList.innerHTML = state.allProjects.map(createProjectCardHTML).join('');
            dom.projectsList.querySelectorAll('.project-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    const projectId = e.currentTarget.dataset.projectId;
                    handleProjectCardClick(projectId);
                });
            });
        }
    }
}

function createProjectCardHTML(project) {
    const creator = state.allUsers.find(u => u.uid === project.createdById);
    const creatorName = creator ? creator.displayName : (project.createdByUsername || 'Unknown');
    const dateString = formatRelativeTime(project.createdAt);

    return `
        <div class="project-card bg-white p-5 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow" data-project-id="${project.id}">
            <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-semibold text-gray-800 truncate">${project.name}</h4>
                <span class="text-xs text-gray-400">${dateString}</span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-2 mb-4">
                ${project.description || 'Pas de description.'}
            </p>
            <div class="flex items-center gap-2 text-sm text-gray-500">
                ${createUserAvatar(creator || { displayName: creatorName }, 'h-5 w-5')}
                <span>${creatorName}</span>
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
    
    const projectData = {
        name: dom.createProjectForm.name.value,
        description: dom.createProjectForm.description.value,
        accessCode: dom.createProjectForm.accessCode.value,
        createdById: state.currentUser.uid,
        createdByUsername: state.currentUser.displayName || `User-${state.currentUser.uid.substring(0, 6)}`,
        createdAt: Timestamp.now(),
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
        updateCurrentProjectId(state.projectToAccessId);
        
        closeAccessProjectModal();
        setLoading(true); 
        
        renderCurrentView(); 
    } else {
        dom.accessCodeError.classList.remove('hidden');
    }
}


function handleBackToProjects() {
    updateCurrentProjectId(null);
    renderCurrentView();
}