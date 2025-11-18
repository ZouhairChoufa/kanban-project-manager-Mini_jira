// Fichier: src/js/utils.js
// Contient des fonctions d'aide réutilisables.

import * as dom from './core/dom.js';

/**
 * Affiche ou cache l'overlay de chargement global.
 * @param {boolean} isLoading - Statut de chargement.
 */
export function setLoading(isLoading) {
    if (isLoading) {
        dom.loadingOverlay.classList.remove('hidden');
    } else {
        dom.loadingOverlay.classList.add('hidden');
    }
}

/**
 * Affiche une notification toast.
 * @param {object} options - Options { title, description, variant }.
 */
export function showToast({ title, description, variant = 'default' }) {
    // ** FIX: Vérifie si toastContainer existe **
    if (!dom.toastContainer) {
        console.error('Toast container not found in dom.js');
        return; 
    }
    
    const toastId = `toast-${Date.now()}`;
    const toast = document.createElement('div');
    const bgColor = variant === 'destructive' ? 'bg-red-500' : 'bg-green-500';
    toast.id = toastId;
    toast.className = `p-4 rounded-md shadow-lg text-white ${bgColor} animate-fade-in`;
    toast.innerHTML = `
        <h4 class="font-semibold">${title}</h4>
        <p class="text-sm">${description}</p>
    `;
    dom.toastContainer.appendChild(toast);
    setTimeout(() => {
        const toastToRemove = document.getElementById(toastId);
        if (toastToRemove) {
            toastToRemove.classList.remove('animate-fade-in');
            toastToRemove.classList.add('animate-fade-out');
            setTimeout(() => toastToRemove.remove(), 300);
        }
    }, 3000);
}

/**
 * Convertit un timestamp Firebase en temps relatif (ex: "2h ago").
 * @param {object} timestamp - L'objet Timestamp de Firebase.
 * @returns {string} Le temps formaté.
 */
export function formatRelativeTime(timestamp) {
    if (!timestamp) return '';
    const ms = timestamp.toMillis ? timestamp.toMillis() : (typeof timestamp === 'number' ? timestamp : Date.now());
    const now = Date.now();
    const diff = now - ms;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return 'just now';
    else if (minutes < 60) return `${minutes}m ago`;
    else if (hours < 24) return `${hours}h ago`;
    else if (days < 7) return `${days}d ago`;
    else return new Date(ms).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

/**
 * Génère le HTML pour un avatar (soit une image, soit des initiales).
 * @param {object} user - L'objet utilisateur (doit avoir displayName, photoURL).
 * @param {string} className - Classes CSS à appliquer.
 * @returns {string} Le HTML de l'avatar.
 */
export function createUserAvatar(user, className = 'h-8 w-8') {
    const title = user?.displayName || 'User';
    if (user && user.photoURL) {
        return `<img src="${user.photoURL}" alt="${title}" title="${title}" class="rounded-full object-cover ${className}">`;
    }
    let initials = 'U';
    if (user && user.displayName) {
        const names = user.displayName.split(' ').filter(Boolean);
        if (names.length === 1) initials = names[0][0];
        else if (names.length >= 2) initials = `${names[0][0]}${names[1][0]}`;
        else initials = user.displayName.substring(0, 1) || 'U';
    }
    return `<div class="flex items-center justify-center rounded-full bg-app-primary/20 text-app-primary font-semibold ${className}" title="${title}">${initials.toUpperCase()}</div>`;
}

/**
 * Gère l'état de chargement du bouton de sauvegarde du modal de tâche.
 * @param {boolean} isSaving - Statut de sauvegarde.
 */
export function setFormSaving(isSaving) {
    dom.saveTaskBtn.disabled = isSaving;
    if (isSaving) {
        dom.saveTaskBtn.insertAdjacentHTML('afterbegin', `<svg class="icon-loader" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>`);
    } else {
        const loader = dom.saveTaskBtn.querySelector('.icon-loader');
        if (loader) loader.remove();
    }
}

// --- GESTION DES ERREURS ---

/**
 * Traduit les codes d'erreur Firebase Storage en messages pour l'utilisateur.
 * @param {object} error - L'objet d'erreur de Firebase.
 * @returns {string} Un message d'erreur lisible.
 */
export function getFriendlyStorageError(error) {
    switch (error.code) {
        case 'storage/unauthorized':
        case 'storage/unauthenticated':
            return 'Permission Denied. Please check your Firebase Storage security rules.';
        case 'storage/object-not-found':
            return 'File not found.';
        case 'storage/canceled':
            return 'Upload was canceled.';
        case 'storage/unknown':
            if (error.message.includes('CORS')) {
                return 'CORS Error. Please check your bucket\'s CORS configuration.';
            }
            return 'An unknown error occurred.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}
// ** FIX: Suppression de l'accolade '}' en trop **