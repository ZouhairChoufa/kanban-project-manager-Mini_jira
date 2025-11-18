import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    Timestamp, 
    query, 
    orderBy,
    setLogLevel,
    setDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { 
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCoc1m-IVplJRK6-1TLeKFK-meEAFECVEw",
  authDomain: "mini-jira-kanban-board.firebaseapp.com",
  projectId: "mini-jira-kanban-board",
  storageBucket: "mini-jira-kanban-board.firebasestorage.app",
  messagingSenderId: "706807233151",
  appId: "1:706807233151:web:f4ca57d2a9604ab3871d4a",
  measurementId: "G-STE06L3GV5"
};
export const appId = firebaseConfig.projectId || 'default-kanban-app';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
setLogLevel('debug');

export { app, auth, db, storage };

export { 
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail
};

export { 
    collection, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    Timestamp, 
    query, 
    orderBy,
    setDoc
};

export { 
    ref,
    uploadBytes,
    getDownloadURL
};
