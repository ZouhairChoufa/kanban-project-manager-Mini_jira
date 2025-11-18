import { state } from './core/state.js';
import * as dom from './core/dom.js';

export function setLoading(loading) {
    if (loading) {
        dom.loadingOverlay.classList.remove('hidden');
    } else {
        dom.loadingOverlay.classList.add('hidden');
    }
}

export function showToast({ title, description, variant = "default" }) {
    const toast = document.createElement('div');
    toast.className = `p-4 rounded-md shadow-lg border max-w-sm animate-fade-in ${
        variant === "destructive" 
            ? "bg-red-50 border-red-200 text-red-800" 
            : "bg-white border-gray-200 text-gray-800"
    }`;
    
    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
                <svg class="w-5 h-5 ${variant === "destructive" ? "text-red-400" : "text-green-400"}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${variant === "destructive" ? "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"}"></path>
                </svg>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-medium">${title}</h4>
                <p class="text-sm opacity-90 mt-1">${description}</p>
            </div>
            <button class="flex-shrink-0 text-gray-400 hover:text-gray-600" onclick="this.parentElement.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;
    
    dom.toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('animate-fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

export function createUserAvatar(user, classes = '') {
    const avatar = document.createElement('div');
    avatar.className = `flex items-center justify-center rounded-full bg-app-primary text-white font-medium ${classes}`;
    
    if (user.photoURL) {
        const img = document.createElement('img');
        img.src = user.photoURL;
        img.alt = user.displayName || 'User';
        img.className = 'w-full h-full rounded-full object-cover';
        avatar.appendChild(img);
    } else {
        const initials = (user.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase();
        avatar.textContent = initials;
    }
    
    return avatar;
}

export function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

export function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePassword(password) {
    return password.length >= 6;
}

export function validateUsername(username) {
    return username.trim().length >= 2;
}

export function validateTaskTitle(title) {
    return title.trim().length >= 3;
}

export function validateProjectName(name) {
    return name.trim().length >= 3;
}

export function validateAccessCode(code) {
    return code.trim().length >= 4;
}

export function getCurrentProject() {
    return state.allProjects.find(p => p.id === state.currentProjectId);
}

export function getCurrentProjectTasks() {
    return state.allTasks.filter(t => t.projectId === state.currentProjectId);
}

export function getCurrentProjectUsers() {
    const project = getCurrentProject();
    if (!project) return [];
    return state.allUsers.filter(u => project.members.includes(u.uid));
}

export function getTaskById(taskId) {
    return state.allTasks.find(t => t.id === taskId);
}

export function getUserById(userId) {
    return state.allUsers.find(u => u.uid === userId);
}

export function getTasksByStatus(status) {
    return getCurrentProjectTasks().filter(t => t.status === status);
}

export function getTasksByAssignee(assigneeId) {
    return getCurrentProjectTasks().filter(t => t.assigneeId === assigneeId);
}

export function getTasksByCreator(creatorId) {
    return getCurrentProjectTasks().filter(t => t.creatorId === creatorId);
}

export function sortTasksByDate(tasks, order = 'desc') {
    return tasks.sort((a, b) => {
        const dateA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const dateB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return order === 'desc' ? dateB - dateA : dateA - dateB;
    });
}

export function filterTasksByName(tasks, query) {
    if (!query) return tasks;
    const lowerQuery = query.toLowerCase();
    return tasks.filter(t => 
        t.title.toLowerCase().includes(lowerQuery) || 
        t.description?.toLowerCase().includes(lowerQuery)
    );
}

export function filterTasksByCreator(tasks, creatorId) {
    if (!creatorId || creatorId === 'all') return tasks;
    return tasks.filter(t => t.creatorId === creatorId);
}
