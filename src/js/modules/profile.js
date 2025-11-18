// Fichier: src/js/modules/profile.js
// Gère la logique du modal de profil utilisateur.

import { 
    auth, db, storage, 
    updateProfile, doc, updateDoc, sendPasswordResetEmail, ref, uploadBytes, getDownloadURL,
    collection, onSnapshot
} from '../core/firebase.js';
import { state, updateAllUsers, updateHasUsersLoaded } from '../core/state.js';
import * as dom from '../core/dom.js';
import { showToast, createUserAvatar, getFriendlyStorageError } from '../utils.js';

/**
 * ** FIX: Logique déplacée depuis main.js **
 * Initialise le listener pour la collection globale des utilisateurs.
 */
export function setupUsersListener(checkAndRenderApp) {
    if (!state.currentUser) return null;
    
    const usersCollectionPath = "/artifacts/mini-jira-kanban-board/public/data/users";
    console.log(`Listening to Firestore at: ${usersCollectionPath}`);
    
    const unsubscribe = onSnapshot(collection(db, usersCollectionPath), (snapshot) => {
        const users = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                uid: doc.id,
                displayName: data.displayName || data.nomAffichage || `User-${doc.id.substring(0,6)}`,
                photoURL: data.photoURL || null
            };
        });
        updateAllUsers(users);
        
        // Met à jour les infos de l'utilisateur actuel depuis la DB
        const userFromDb = users.find(u => u.uid === state.currentUser.uid);
        if (userFromDb) {
            state.currentUser.displayName = userFromDb.displayName;
            state.currentUser.photoURL = userFromDb.photoURL;
            setupUser(); // Met à jour l'en-tête
        }

        updateHasUsersLoaded(true);
        if (checkAndRenderApp) checkAndRenderApp(); // Vérifie si les projets sont aussi chargés
    }, (error) => {
        console.error("Users listener error:", error);
        updateHasUsersLoaded(true); // Débloque le chargement même en cas d'erreur
        if (checkAndRenderApp) checkAndRenderApp();
    });
    return unsubscribe;
}


/**
 * Met à jour l'avatar et le nom dans l'en-tête.
 */
export function setupUser() {
    if (!state.currentUser) return;
    const user = state.currentUser;
    const username = user.displayName || `User-${user.uid.substring(0, 6)}`;
    dom.userDisplayName.textContent = username;
    dom.headerAvatar.innerHTML = createUserAvatar(user, 'h-8 w-8');
}

function openProfileModal() {
    if (!state.currentUser) return;
    const user = state.currentUser;
    
    dom.profileAvatarContainer.innerHTML = createUserAvatar(user, 'h-24 w-24');
    
    // Calcule les statistiques basées sur les tâches *actuellement chargées*
    const uid = user.uid;
    dom.statsTodo.textContent = state.allTasks.filter(t => t.createdById === uid && t.status === 'To Do').length;
    dom.statsInProgress.textContent = state.allTasks.filter(t => t.createdById === uid && t.status === 'In Progress').length;
    dom.statsDone.textContent = state.allTasks.filter(t => t.createdById === uid && t.status === 'Done').length;
    
    dom.profileUsernameInput.value = user.displayName || '';
    dom.profileEmail.textContent = user.email || 'No email provided.';
    
    dom.profileModal.showModal();
}

function closeProfileModal() {
    dom.profileModal.close();
}

/**
 * Affiche l'indicateur de chargement lors de l'upload de l'avatar.
 * @param {boolean} isUploading - Statut de chargement.
 */
function setAvatarUploading(isUploading) {
    if (isUploading) {
        dom.profileAvatarContainer.innerHTML = `<div class="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center"><svg class="icon-upload-loader animate-spin text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>`;
    } else {
        dom.profileAvatarContainer.innerHTML = createUserAvatar(state.currentUser, 'h-24 w-24');
    }
}

async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !state.currentUser) return;
    
    setAvatarUploading(true);
    const storageRef = ref(storage, `profile-images/${state.currentUser.uid}/${file.name}`);
    
    try {
        const uploadTask = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(uploadTask.ref);
        
        // Mettre à jour l'URL dans Auth
        await updateProfile(state.currentUser, { photoURL: downloadURL });
        
        // Mettre à jour l'URL dans Firestore
        const userDocRef = doc(db, "/artifacts/mini-jira-kanban-board/public/data/users", state.currentUser.uid);
        await updateDoc(userDocRef, { photoURL: downloadURL });
        
        state.currentUser.photoURL = downloadURL; // Mettre à jour l'état local
        
        showToast({ title: "Success", description: "Profile photo updated!" });
        setupUser(); // Met à jour l'en-tête
    } catch (error) {
        console.error("Image upload error:", error.code, error.message);
        const friendlyError = getFriendlyStorageError(error);
        showToast({ variant: "destructive", title: "Upload Error", description: friendlyError });
    } finally {
        setAvatarUploading(false);
        dom.profileImageUpload.value = null; // Réinitialise l'input
    }
}

async function handleUsernameSave(e) {
    e.preventDefault();
    if (!state.currentUser) return;
    
    const newUsername = dom.profileUsernameInput.value.trim();
    if (newUsername.length < 3) {
        showToast({ variant: "destructive", title: "Error", description: "Username must be at least 3 characters." });
        return;
    }
    
    dom.profileSaveUsernameBtn.disabled = true;
    try {
        // Mettre à jour le nom dans Auth
        await updateProfile(state.currentUser, { displayName: newUsername });
        
        // Mettre à jour le nom dans Firestore
        const userDocRef = doc(db, "/artifacts/mini-jira-kanban-board/public/data/users", state.currentUser.uid);
        await updateDoc(userDocRef, { displayName: newUsername });
        
        state.currentUser.displayName = newUsername; // Mettre à jour l'état local
        
        showToast({ title: "Success", description: "Username updated!" });
        setupUser(); // Met à jour l'en-tête
        closeProfileModal();
    } catch (error) {
        console.error("Username update error:", error);
        showToast({ variant: "destructive", title: "Error", description: "Could not update username." });
    } finally {
        dom.profileSaveUsernameBtn.disabled = false;
    }
}

async function handlePasswordReset() {
    if (!state.currentUser || !state.currentUser.email) {
        showToast({ variant: "destructive", title: "Error", description: "No email associated with this account." });
        return;
    }
    try {
        await sendPasswordResetEmail(auth, state.currentUser.email);
        showToast({ title: "Email Sent", description: "Password reset email sent to your inbox." });
    } catch (error) {
        console.error("Password reset error:", error);
        showToast({ variant: "destructive", title: "Error", description: "Could not send reset email." });
    }
}

export function initProfileListeners() {
    dom.userInfo.addEventListener('click', openProfileModal);
    dom.closeProfileModalBtn.addEventListener('click', closeProfileModal);
    dom.profileUploadBtn.addEventListener('click', () => dom.profileImageUpload.click());
    dom.profileImageUpload.addEventListener('change', handleImageUpload);
    dom.profileUsernameForm.addEventListener('submit', handleUsernameSave);
    dom.profileResetPasswordBtn.addEventListener('click', handlePasswordReset);
}