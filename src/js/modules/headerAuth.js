import { state } from '../core/state.js';
import { signOut, auth } from '../core/firebase.js';
import { showToast, createUserAvatar } from '../utils.js';

export function renderHeaderAuthUI() {
    const guestSection = document.getElementById('global-header-auth-guest');
    const userSection = document.getElementById('global-header-auth-user');
    const avatarContainer = document.getElementById('global-header-avatar');
    
    if (!guestSection || !userSection) return;
    
    if (state.currentUser) {
        guestSection.classList.add('hidden');
        userSection.classList.remove('hidden');
        
        if (avatarContainer) {
            avatarContainer.innerHTML = createUserAvatar(state.currentUser, 'h-8 w-8');
        }
    } else {
        guestSection.classList.remove('hidden');
        userSection.classList.add('hidden');
    }
    
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 50);
}

export function initHeaderAuthListeners() {
    const loginBtn = document.getElementById('global-header-login-btn');
    const signupBtn = document.getElementById('global-header-signup-btn');
    const logoutBtn = document.getElementById('global-header-logout-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            document.getElementById('app-container').classList.add('hidden');
            document.getElementById('auth-container').classList.remove('hidden');
            document.getElementById('login-form-container').classList.remove('hidden');
            document.getElementById('signup-form-container').classList.add('hidden');
            setTimeout(() => {
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 50);
        });
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            document.getElementById('app-container').classList.add('hidden');
            document.getElementById('auth-container').classList.remove('hidden');
            document.getElementById('login-form-container').classList.add('hidden');
            document.getElementById('signup-form-container').classList.remove('hidden');
            setTimeout(() => {
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }, 50);
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
                showToast({ title: "Déconnecté", description: "Vous avez été déconnecté avec succès." });
            } catch (error) {
                showToast({ variant: "destructive", title: "Erreur", description: "Impossible de se déconnecter." });
            }
        });
    }
}
