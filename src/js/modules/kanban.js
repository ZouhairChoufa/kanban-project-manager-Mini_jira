// Fichier: src/js/modules/kanban.js
// Gère toute la logique du tableau Kanban (affichage, tâches, drag-drop, modaux de tâches).

import { db, collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, Timestamp } from '../core/firebase.js';
import { state, STATUSES, updateAllTasks, updateDraggedTaskId, updateTaskToDeleteId, updateIsSubmitting, updateHasTasksLoaded } from '../core/state.js';
import * as dom from '../core/dom.js';
import { showToast, formatRelativeTime, createUserAvatar, setFormSaving, setLoading } from '../utils.js'; 
// --- INITIALISATION ---

/**
 * Initialise tous les écouteurs d'événements pour le Kanban.
 */
export function initKanbanListeners() {
    // Boutons d'ajout de tâche
    dom.addTaskBtn.addEventListener('click', () => openTaskModal(null));
    dom.fabAddTask.addEventListener('click', () => openTaskModal(null));
    
    // Filtres
    dom.filterNameInput.addEventListener('input', renderApp);
    dom.sortDateSelect.addEventListener('change', renderApp);
    dom.filterCreatorSelect.addEventListener('change', renderApp);

    // Modal de Tâche
    dom.taskForm.addEventListener('submit', handleSubmitTask);
    dom.closeModalBtn.addEventListener('click', closeTaskModal);
    dom.cancelModalBtn.addEventListener('click', closeTaskModal);
    dom.deleteTaskBtn.addEventListener('click', () => openDeleteModal());

    // Modal de Suppression
    dom.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    dom.confirmDeleteBtn.addEventListener('click', handleDeleteTask);
}

/**
 * Initialise le listener Firestore pour la collection de tâches du projet en cours.
 * @returns {Function} La fonction pour se désabonner (unsubscribe).
 */
export function setupFirestoreListener() {
    if (!state.currentUser || !state.currentProjectId) return null;

    const tasksCollectionPath = `/artifacts/mini-jira-kanban-board/public/data/projects/${state.currentProjectId}/tasks`;
    console.log(`Listening to Firestore at: ${tasksCollectionPath}`);
    
    const tasksCollection = collection(db, tasksCollectionPath);
    const q = query(tasksCollection); // Tri client-side

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => {
            const data = doc.data();
            // Normalise les données (gère les anciens et nouveaux noms de champs)
            const normalizedTask = {
                id: doc.id,
                title: data.title || data.titre || 'Untitled Task',
                description: data.description || '',
                status: data.status || data.statut || 'To Do',
                assigneeId: data.assigneeId || data.assigneA_userId || '',
                createdById: data.createdById || data.creePar_userId || '',
                createdByUsername: data.createdByUsername || 'Unknown',
                createdAt: data.createdAt || data.dateCreation || Timestamp.now(),
                completedAt: data.completedAt || null, // Pour le dashboard
            };
            if (normalizedTask.status === 'TODO') normalizedTask.status = 'To Do';
            if (normalizedTask.status === 'IN_PROGRESS') normalizedTask.status = 'In Progress';
            if (normalizedTask.status === 'DONE') normalizedTask.status = 'Done';
            return normalizedTask;
        });
        
        updateAllTasks(tasks);
        updateHasTasksLoaded(true); // Indique que les tâches sont chargées
        renderApp();
        setLoading(false); 
        
    }, (error) => {
        console.error("Firestore error:", error);
        showToast({ variant: "destructive", title: "Erreur de base de données", description: "Impossible de charger les tâches pour ce projet."});
        updateHasTasksLoaded(true); // Débloque même en cas d'erreur
        renderApp();
        setLoading(false); 
    });

    return unsubscribe;
}

// --- AFFICHAGE (RENDERING) ---

/**
 * Fonction principale d'affichage du Kanban. Filtre, trie et affiche les tâches.
 */
export function renderApp() {
    if (!state.currentProjectId || !state.hasTasksLoaded || !state.hasUsersLoaded) {
        dom.kanbanBoard.innerHTML = ''; // Vide le tableau si les données ne sont pas prêtes
        dom.filterCreatorSelect.innerHTML = '<option value="all">Filter: All Creators</option>';
        return;
    }
    
    // 1. Appliquer les filtres
    const nameFilter = dom.filterNameInput.value.toLowerCase();
    const creatorFilter = dom.filterCreatorSelect.value;
    
    let filteredTasks = state.allTasks.filter(task => {
        const title = task.title || '';
        const nameMatch = title.toLowerCase().includes(nameFilter);
        const creatorMatch = (creatorFilter === 'all') || (task.createdById === creatorFilter);
        return nameMatch && creatorMatch;
    });
    
    // 2. Appliquer le tri
    const sortOrder = dom.sortDateSelect.value;
    filteredTasks.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    // 3. Afficher le tableau
    renderKanbanBoard(filteredTasks);
    
    // 4. Mettre à jour le filtre des créateurs
    renderCreatorFilter();
}

/**
 * Affiche le filtre des créateurs en fonction des tâches actuelles.
 */
function renderCreatorFilter() {
    const creators = state.allTasks.reduce((acc, task) => {
        if (task.createdById && !acc.has(task.createdById)) {
            const user = state.allUsers.find(u => u.uid === task.createdById);
            const username = user?.displayName || task.createdByUsername || 'Unknown';
            acc.set(task.createdById, username);
        }
        return acc;
    }, new Map());
    
    const currentSelection = dom.filterCreatorSelect.value;
    dom.filterCreatorSelect.innerHTML = '<option value="all">Filter: All Creators</option>';
    creators.forEach((username, uid) => {
        const selected = uid === currentSelection ? 'selected' : '';
        dom.filterCreatorSelect.innerHTML += `<option value="${uid}" ${selected}>${username}</option>`;
    });
}

/**
 * Affiche les colonnes et les cartes du Kanban.
 * @param {Array} tasksToRender - Tâches filtrées et triées.
 */
function renderKanbanBoard(tasksToRender) {
    dom.kanbanBoard.innerHTML = ''; 
    const columnColors = {
        'To Do': { bg: 'bg-blue-100', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-200' },
        'In Progress': { bg: 'bg-orange-100', border: 'border-orange-200', text: 'text-orange-800', badge: 'bg-orange-200' },
        'Done': { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-800', badge: 'bg-green-200' },
    };

    for (const status of STATUSES) {
        const tasksInColumn = tasksToRender.filter(task => task.status === status);
        const colors = columnColors[status];
        
        const column = document.createElement('div');
        column.className = `rounded-lg h-full transition-colors duration-300 ${colors.bg} ${colors.border}`;
        column.innerHTML = `
            <div class="flex items-center justify-between p-4 border-b ${colors.border}">
                <h3 class="text-lg font-semibold ${colors.text}">${status}</h3>
                <span class="px-2 py-0.5 rounded-full text-sm font-medium ${colors.badge} ${colors.text}">
                    ${tasksInColumn.length}
                </span>
            </div>
            <div class="p-4 space-y-4 min-h-[200px] kanban-column-content" data-status="${status}">
                ${tasksInColumn.length === 0 
                    ? `<div class="flex items-center justify-center h-full text-sm text-gray-500/70">Déposez les tâches ici</div>`
                    : tasksInColumn.map(createKanbanCardHTML).join('')
                }
            </div>
        `;
        dom.kanbanBoard.appendChild(column);
    }
    
    addDragDropListeners();
    addCardClickListeners();
}

/**
 * Crée le HTML pour une seule carte Kanban.
 * @param {object} task - L'objet tâche.
 * @returns {string} Le HTML de la carte.
 */
function createKanbanCardHTML(task) {
    const assignee = state.allUsers.find(user => user.uid === task.assigneeId && user.displayName);
    let createdByText = '';
    if (task.createdById === state.currentUser?.uid) {
        createdByText = 'Créé par: Vous';
    } else {
        const creator = state.allUsers.find(u => u.uid === task.createdById);
        const creatorName = creator?.displayName || task.createdByUsername || 'Unknown';
        createdByText = `Créé par: ${creatorName}`;
    }
    const dateString = formatRelativeTime(task.createdAt);

    return `
        <div class="bg-white p-3 rounded-lg shadow-sm border cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow duration-200 flex items-start group kanban-card" 
             draggable="true" 
             data-task-id="${task.id}">
            <div class="flex-1 space-y-2 overflow-hidden">
                <p class="font-medium text-gray-800 truncate">${task.title}</p>
                <p class="text-sm text-gray-600 line-clamp-2">${task.description || ''}</p>
                ${assignee ? `
                <div class="flex items-center gap-2 text-sm text-gray-500 pt-1">
                    <div class="flex items-center gap-1" title="Assigné à: ${assignee.displayName}">
                        ${createUserAvatar(assignee, 'h-5 w-5')}
                        <span>${assignee.displayName}</span>
                    </div>
                </div>
                ` : ''}
                <div class="flex justify-between items-center text-xs text-gray-400 pt-1">
                    <span>${createdByText}</span>
                    <span>${dateString}</span>
                </div>
            </div>
            <svg class="icon-grip text-gray-400/50 group-hover:text-gray-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="15" r="1"/></svg>
        </div>
    `;
}

// --- LOGIQUE DU MODAL DE TÂCHE ---

function populateModalDropdowns() {
    dom.statusSelect.innerHTML = STATUSES.map(status => `<option value="${status}">${status}</option>`).join('');
    
    const validUsers = state.allUsers.filter(user => user.displayName);
    const userOptions = validUsers.map(user => `<option value="${user.uid}">${user.displayName}</option>`);
    dom.assigneeSelect.innerHTML = `<option value="">Non assigné</option>` + userOptions.join('');
}

function openTaskModal(task = null) {
    dom.taskForm.reset();
    dom.titleError.classList.add('hidden');
    populateModalDropdowns();
    
    if (task) {
        dom.modalTitle.textContent = 'Modifier la Tâche';
        dom.modalDescription.textContent = 'Mettez à jour les détails de votre tâche.';
        dom.taskIdInput.value = task.id;
        dom.titleInput.value = task.title;
        dom.descriptionInput.value = task.description || '';
        dom.statusSelect.value = task.status;
        dom.assigneeSelect.value = task.assigneeId || '';
        dom.deleteTaskBtn.classList.remove('hidden');
        dom.saveBtnText.textContent = 'Sauvegarder';
    } else {
        dom.modalTitle.textContent = 'Créer une Tâche';
        dom.modalDescription.textContent = 'Remplissez le formulaire pour créer une nouvelle tâche.';
        dom.taskIdInput.value = '';
        dom.deleteTaskBtn.classList.add('hidden');
        dom.saveBtnText.textContent = 'Créer Tâche';
    }
    dom.taskModal.showModal();
}

function closeTaskModal() { dom.taskModal.close(); }

function openDeleteModal() {
    const taskId = dom.taskIdInput.value;
    if (taskId) {
        updateTaskToDeleteId(taskId);
        dom.deleteModal.showModal();
    }
}
function closeDeleteModal() {
    updateTaskToDeleteId(null);
    dom.deleteModal.close();
}

function validateForm() {
    let isValid = true;
    if (dom.titleInput.value.length < 3) {
        dom.titleError.classList.remove('hidden');
        isValid = false;
    } else {
        dom.titleError.classList.add('hidden');
    }
    return isValid;
}

// --- OPÉRATIONS CRUD (Create, Read, Update, Delete) ---

async function handleSubmitTask(e) {
    e.preventDefault();
    if (state.isSubmitting || !validateForm() || !state.currentUser || !state.currentProjectId) return;
    
    updateIsSubmitting(true);
    setFormSaving(true);
    
    const taskData = {
        title: dom.titleInput.value,
        description: dom.descriptionInput.value,
        status: dom.statusSelect.value,
        assigneeId: dom.assigneeSelect.value || '', 
    };
    const taskId = dom.taskIdInput.value;
    const tasksCollectionPath = `/artifacts/mini-jira-kanban-board/public/data/projects/${state.currentProjectId}/tasks`;
    
    try {
        if (taskId) {
            // Mettre à jour la tâche
            const taskDoc = doc(db, tasksCollectionPath, taskId);
            await updateDoc(taskDoc, taskData);
            showToast({ title: "Succès", description: "Tâche mise à jour." });
        } else {
            // Créer une nouvelle tâche
            await addDoc(collection(db, tasksCollectionPath), {
                ...taskData,
                createdById: state.currentUser.uid,
                createdByUsername: state.currentUser.displayName || `User-${state.currentUser.uid.substring(0, 6)}`,
                createdAt: Timestamp.now(),
                completedAt: null, // Initialise à null
            });
            showToast({ title: "Succès", description: "Tâche créée." });
        }
        closeTaskModal();
    } catch (error) {
        console.error("Error submitting task:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder la tâche." });
    } finally {
        updateIsSubmitting(false);
        setFormSaving(false);
    }
}

async function handleDeleteTask() {
    if (!state.taskToDeleteId || !state.currentUser || !state.currentProjectId) return;

    const tasksCollectionPath = `/artifacts/mini-jira-kanban-board/public/data/projects/${state.currentProjectId}/tasks`;
    
    try {
        await deleteDoc(doc(db, tasksCollectionPath, state.taskToDeleteId));
        showToast({ title: "Succès", description: "Tâche supprimée." });
        closeDeleteModal();
        closeTaskModal(); // Ferme aussi le modal d'édition
    } catch (error) {
        console.error("Error deleting task:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la tâche." });
    }
}

async function handleStatusUpdate(taskId, newStatus) {
    const task = state.allTasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus || !state.currentUser || !state.currentProjectId) return;
    
    const tasksCollectionPath = `/artifacts/mini-jira-kanban-board/public/data/projects/${state.currentProjectId}/tasks`;
    
    // NOUVELLE LOGIQUE: Ajouter 'completedAt' si la tâche passe à "Done"
    let updateData = { status: newStatus };
    if (newStatus === 'Done' && task.status !== 'Done') {
        updateData.completedAt = Timestamp.now();
    }

    try {
        const taskDoc = doc(db, tasksCollectionPath, taskId);
        await updateDoc(taskDoc, updateData); // Utilise les données de mise à jour
    } catch (error) {
        console.error("Error updating task status:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le statut." });
    }
}


// --- LOGIQUE DRAG & DROP ---

function addDragDropListeners() {
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
    });
    document.querySelectorAll('.kanban-column-content').forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    const taskId = e.currentTarget.dataset.taskId;
    updateDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    // setTimeout(() => e.currentTarget.classList.add('opacity-50'), 0);
    e.currentTarget.classList.add('opacity-50');
}

function handleDragOver(e) {
    e.preventDefault(); 
    e.currentTarget.classList.add('bg-black/10'); 
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('bg-black/10');
}

function handleDrop(e) {
    e.preventDefault();
    const column = e.currentTarget;
    const newStatus = column.dataset.status;
    column.classList.remove('bg-black/10');
    
    const draggedCard = document.querySelector(`[data-task-id="${state.draggedTaskId}"]`);
    if (draggedCard) draggedCard.classList.remove('opacity-50');
    
    if (state.draggedTaskId && newStatus) {
        handleStatusUpdate(state.draggedTaskId, newStatus);
    }
    updateDraggedTaskId(null);
}

// --- ÉCOUTEURS DE CLIC SUR LES CARTES ---

function addCardClickListeners() {
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.taskId;
            const task = state.allTasks.find(t => t.id === taskId);
            if (task) openTaskModal(task);
        });
    });
}