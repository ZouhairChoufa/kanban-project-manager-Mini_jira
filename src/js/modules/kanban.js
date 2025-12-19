import { db, collection, query, onSnapshot, doc, updateDoc, addDoc, deleteDoc, Timestamp } from '../core/firebase.js';
import { state, STATUSES, updateAllTasks, updateDraggedTaskId, updateTaskToDeleteId, updateIsSubmitting, updateHasTasksLoaded } from '../core/state.js';
import * as dom from '../core/dom.js';
import { showToast, formatRelativeTime, createUserAvatar, setFormSaving, setLoading } from '../utils.js';

export function initKanbanListeners() {
    dom.addTaskBtn.addEventListener('click', () => openTaskModal(null));
    dom.fabAddTask.addEventListener('click', () => openTaskModal(null));
    
    dom.filterNameInput.addEventListener('input', renderApp);
    dom.sortDateSelect.addEventListener('change', renderApp);
    dom.filterCreatorSelect.addEventListener('change', renderApp);

    dom.taskForm.addEventListener('submit', handleSubmitTask);
    dom.closeModalBtn.addEventListener('click', closeTaskModal);
    dom.cancelModalBtn.addEventListener('click', closeTaskModal);
    dom.deleteTaskBtn.addEventListener('click', () => openDeleteModal());

    dom.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    dom.confirmDeleteBtn.addEventListener('click', handleDeleteTask);
}

/**
 * @returns {Function} La fonction pour se désabonner (unsubscribe).
 */
export function setupFirestoreListener() {
    if (!state.currentUser || !state.currentProjectId) return null;

    const tasksCollectionPath = `/artifacts/mini-jira-kanban-board/public/data/projects/${state.currentProjectId}/tasks`;
    console.log(`Listening to Firestore at: ${tasksCollectionPath}`);
    const tasksCollection = collection(db, tasksCollectionPath);
    const q = query(tasksCollection);

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = snapshot.docs.map((doc) => {
            const data = doc.data();
            const normalizedTask = {
                id: doc.id,
                title: data.title || data.titre || 'Untitled Task',
                description: data.description || '',
                status: data.status || data.statut || 'To Do',
                assigneeId: data.assigneeId || data.assigneA_userId || '',
                createdById: data.createdById || data.creePar_userId || '',
                createdByUsername: data.createdByUsername || 'Unknown',
                createdAt: data.createdAt || data.dateCreation || Timestamp.now(),
                completedAt: data.completedAt || null,
                priority: data.priority || 'Medium',
                dueDate: data.dueDate || '',
                tags: data.tags || []
            };
            if (normalizedTask.status === 'TODO') normalizedTask.status = 'To Do';
            if (normalizedTask.status === 'IN_PROGRESS') normalizedTask.status = 'In Progress';
            if (normalizedTask.status === 'DONE') normalizedTask.status = 'Done';
            return normalizedTask;
        });
        updateAllTasks(tasks);
        updateHasTasksLoaded(true);
        renderApp();
        setLoading(false);
    }, (error) => {
        console.error("Firestore error:", error);
        showToast({ variant: "destructive", title: "Erreur de base de données", description: "Impossible de charger les tâches pour ce projet."});
        updateHasTasksLoaded(true);
        renderApp();
        setLoading(false);
    });
    return unsubscribe;
}

export function renderApp() {
    if (!state.currentProjectId || !state.hasTasksLoaded || !state.hasUsersLoaded) {
        dom.kanbanBoard.innerHTML = ''; 
        dom.filterCreatorSelect.innerHTML = '<option value="all">Filtre : Tous les créateurs</option>';
        return;
    }
    
    const nameFilter = dom.filterNameInput.value.toLowerCase();
    const creatorFilter = dom.filterCreatorSelect.value;
    
    let filteredTasks = state.allTasks.filter(task => {
        const title = task.title || '';
        const nameMatch = title.toLowerCase().includes(nameFilter);
        const creatorMatch = (creatorFilter === 'all') || (task.createdById === creatorFilter);
        return nameMatch && creatorMatch;
    });
    
    const sortOrder = dom.sortDateSelect.value;
    filteredTasks.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });

    renderKanbanBoard(filteredTasks);
    
    renderCreatorFilter();
}


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
    dom.filterCreatorSelect.innerHTML = '<option value="all">Filtre : Tous les créateurs</option>';
    creators.forEach((username, uid) => {
        const selected = uid === currentSelection ? 'selected' : '';
        dom.filterCreatorSelect.innerHTML += `<option value="${uid}" ${selected}>${username}</option>`;
    });
}

/**
 * @param {Array} tasksToRender - Tâches filtrées et triées.
 */
function renderKanbanBoard(tasksToRender) {
    dom.kanbanBoard.innerHTML = ''; 
    const statusConfig = {
        'To Do': { pill: 'bg-blue-100 text-blue-700', icon: 'circle' },
        'In Progress': { pill: 'bg-orange-100 text-orange-700', icon: 'clock' },
        'Done': { pill: 'bg-green-100 text-green-700', icon: 'check-circle' }
    };

    for (const status of STATUSES) {
        const tasksInColumn = tasksToRender.filter(task => task.status === status);
        const config = statusConfig[status];
        
        const column = document.createElement('div');
        column.className = 'bg-slate-100/80 rounded-lg min-h-[600px]';
        column.innerHTML = `
            <div class="p-3 border-b border-slate-200">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-1 text-xs font-medium rounded ${config.pill}">
                            <i data-lucide="${config.icon}" class="w-3 h-3 inline mr-1"></i>
                            ${status}
                        </span>
                    </div>
                    <span class="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        ${tasksInColumn.length}
                    </span>
                </div>
            </div>
            <div class="p-2 space-y-2 kanban-column-content" data-status="${status}">
                ${tasksInColumn.length === 0 
                    ? `<div class="flex items-center justify-center h-32 text-xs text-slate-400 border-2 border-dashed border-slate-300 rounded bg-white/50">Déposez les tâches ici</div>`
                    : tasksInColumn.map(createKanbanCardHTML).join('')
                }
            </div>
        `;
        dom.kanbanBoard.appendChild(column);
    }
    
    addDragDropListeners();
    addCardClickListeners();
    
    // Render Lucide icons for the new cards
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

/**
 * @param {object} task - L'objet tâche.
 * @returns {string} Le HTML de la carte.
 */
function createKanbanCardHTML(task) {
    const assignee = state.allUsers.find(user => user.uid === task.assigneeId && user.displayName);
    const priority = task.priority || 'Medium';
    const taskId = `PC-${task.id.substring(0, 2).toUpperCase()}`;
    
    const priorityConfig = {
        'Low': { icon: 'arrow-down', color: 'text-green-600' },
        'Medium': { icon: 'minus', color: 'text-yellow-600' },
        'High': { icon: 'arrow-up', color: 'text-red-600' }
    };
    
    const statusBorderConfig = {
        'To Do': 'border-l-blue-500',
        'In Progress': 'border-l-orange-500',
        'Done': 'border-l-green-500'
    };
    
    const priorityStyle = priorityConfig[priority];
    const borderColor = statusBorderConfig[task.status] || 'border-l-slate-500';
    
    // Due date logic
    let dueDateHTML = '';
    if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const isOverdue = dueDate <= today;
        const dateColor = isOverdue ? 'text-red-600' : 'text-slate-500';
        dueDateHTML = `
            <div class="flex items-center gap-1 ${dateColor}">
                <i data-lucide="calendar" class="w-3 h-3"></i>
                <span class="text-xs">${task.dueDate}</span>
            </div>
        `;
    }
    
    // Tags HTML
    const tagsHTML = task.tags && task.tags.length > 0 ? `
        <div class="flex flex-wrap gap-1 mb-2">
            ${task.tags.map(tag => `<span class="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5">${tag}</span>`).join('')}
        </div>
    ` : '';

    return `
        <div class="bg-white border-t border-r border-b border-slate-200 ${borderColor} border-l-4 rounded-md shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 group kanban-card" 
             draggable="true" 
             data-task-id="${task.id}">
            <div class="p-3">
                ${tagsHTML}
                <h4 class="text-sm text-slate-800 font-medium leading-tight mb-2">${task.title}</h4>
                
                ${task.description ? `<p class="text-xs text-slate-600 mb-3 line-clamp-2">${task.description}</p>` : ''}
                
                <div class="flex items-center justify-between mt-3">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-slate-500 font-medium">${taskId}</span>
                        <i data-lucide="${priorityStyle.icon}" class="w-3 h-3 ${priorityStyle.color}"></i>
                        ${dueDateHTML}
                    </div>
                    ${assignee ? `
                        <div class="flex items-center" title="${assignee.displayName}">
                            ${createUserAvatar(assignee, 'h-6 w-6 text-xs')}
                        </div>
                    ` : '<div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center"><i data-lucide="user" class="w-3 h-3 text-slate-400"></i></div>'}
                </div>
            </div>
        </div>
    `;
}


function populateModalDropdowns() {
    dom.statusSelect.innerHTML = STATUSES.map(status => `<option value="${status}">${status}</option>`).join('');
    
    // Clear and populate assignee dropdown
    dom.assigneeSelect.innerHTML = '<option value="">Non assigné</option>';
    
    const currentProject = state.allProjects.find(p => p.id === state.currentProjectId);
    if (currentProject && currentProject.members && currentProject.members.length > 0) {
        const projectMembers = state.allUsers.filter(user => 
            currentProject.members.includes(user.uid)
        );
        projectMembers.forEach(user => {
            const displayName = user.displayName || `User-${user.uid.substring(0, 6)}`;
            dom.assigneeSelect.innerHTML += `<option value="${user.uid}">${displayName}</option>`;
        });
    }
    
    // Add priority dropdown if it exists
    const prioritySelect = document.getElementById('priority');
    if (prioritySelect) {
        prioritySelect.innerHTML = `
            <option value="Low">Basse</option>
            <option value="Medium" selected>Moyenne</option>
            <option value="High">Haute</option>
        `;
    }
}

export function openTaskModalFromCalendar(task) {
    openTaskModal(task);
}

export function openTaskModalWithDate(date) {
    openTaskModal(null);
    const dueDateInput = document.getElementById('due-date');
    if (dueDateInput) {
        dueDateInput.value = date;
    }
}

function openTaskModal(task = null) {
    dom.taskForm.reset();
    dom.titleError.classList.add('hidden');
    populateModalDropdowns();
    
    const dueDateInput = document.getElementById('due-date');
    const tagsInput = document.getElementById('tags');
    const tagsContainer = document.getElementById('tags-container');
    
    if (task) {
        dom.modalTitle.textContent = 'Modifier la Tâche';
        dom.modalDescription.textContent = 'Mettez à jour les détails de votre tâche.';
        dom.taskIdInput.value = task.id;
        dom.titleInput.value = task.title;
        dom.descriptionInput.value = task.description || '';
        dom.statusSelect.value = task.status;
        dom.assigneeSelect.value = task.assigneeId || '';
        
        const prioritySelect = document.getElementById('priority');
        if (prioritySelect) {
            prioritySelect.value = task.priority || 'Medium';
        }
        
        if (dueDateInput && task.dueDate) {
            dueDateInput.value = task.dueDate;
        }
        
        if (tagsContainer && task.tags) {
            tagsContainer.innerHTML = task.tags.map(tag => 
                `<span class="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5 flex items-center gap-1">
                    ${tag}
                    <button type="button" onclick="this.parentElement.remove()" class="hover:text-blue-900">&times;</button>
                </span>`
            ).join('');
        }
        
        dom.deleteTaskBtn.classList.remove('hidden');
        dom.saveBtnText.textContent = 'Sauvegarder';
    } else {
        dom.modalTitle.textContent = 'Créer une Tâche';
        dom.modalDescription.textContent = 'Remplissez le formulaire pour créer une nouvelle tâche.';
        dom.taskIdInput.value = '';
        if (tagsContainer) tagsContainer.innerHTML = '';
        dom.deleteTaskBtn.classList.add('hidden');
        dom.saveBtnText.textContent = 'Créer Tâche';
    }
    
    // Tags input handler
    if (tagsInput) {
        tagsInput.onkeydown = (e) => {
            if (e.key === 'Enter' && tagsInput.value.trim()) {
                e.preventDefault();
                const tag = tagsInput.value.trim();
                tagsContainer.innerHTML += `<span class="bg-blue-100 text-blue-800 text-xs rounded-full px-2 py-0.5 flex items-center gap-1">
                    ${tag}
                    <button type="button" onclick="this.parentElement.remove()" class="hover:text-blue-900">&times;</button>
                </span>`;
                tagsInput.value = '';
            }
        };
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
    
    const prioritySelect = document.getElementById('priority');
    const dueDateInput = document.getElementById('due-date');
    const tagsContainer = document.getElementById('tags-container');
    
    // Extract tags from container
    const tags = Array.from(tagsContainer.querySelectorAll('span')).map(span => 
        span.textContent.replace('×', '').trim()
    );
    
    const taskData = {
        title: dom.titleInput.value,
        description: dom.descriptionInput.value,
        status: dom.statusSelect.value,
        assigneeId: dom.assigneeSelect.value || '',
        priority: prioritySelect ? prioritySelect.value : 'Medium',
        dueDate: dueDateInput ? dueDateInput.value : '',
        tags: tags
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
                completedAt: null, 
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
        closeTaskModal(); 
    } catch (error) {
        console.error("Error deleting task:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer la tâche." });
    }
}

async function handleStatusUpdate(taskId, newStatus) {
    const task = state.allTasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus || !state.currentUser || !state.currentProjectId) return;
    
    const tasksCollectionPath = `/artifacts/mini-jira-kanban-board/public/data/projects/${state.currentProjectId}/tasks`;
    
    let updateData = { status: newStatus };
    if (newStatus === 'Done' && task.status !== 'Done') {
        updateData.completedAt = Timestamp.now();
    }

    try {
        const taskDoc = doc(db, tasksCollectionPath, taskId);
        await updateDoc(taskDoc, updateData); 
    } catch (error) {
        console.error("Error updating task status:", error);
        showToast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le statut." });
    }
}



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
    e.currentTarget.classList.add('opacity-50', 'scale-105', 'rotate-2');
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
    if (draggedCard) draggedCard.classList.remove('opacity-50', 'scale-105', 'rotate-2');
    
    if (state.draggedTaskId && newStatus) {
        handleStatusUpdate(state.draggedTaskId, newStatus);
    }
    updateDraggedTaskId(null);
}


function addCardClickListeners() {
    document.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const taskId = e.currentTarget.dataset.taskId;
            const task = state.allTasks.find(t => t.id === taskId);
            if (task) openTaskModal(task);
        });
    });
}