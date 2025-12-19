# TaskFlow - Gestion de Projet Professionnelle

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.6.1-orange.svg)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8.svg)](https://tailwindcss.com/)

Une application moderne de gestion de projet inspirée de Jira, construite avec Vanilla JavaScript, Firebase et Tailwind CSS. Gérez vos projets, suivez vos tâches et collaborez avec votre équipe en temps réel.

---

## 🎯 Vue d'ensemble

TaskFlow est une solution complète de gestion de projet qui combine la simplicité d'utilisation avec des fonctionnalités professionnelles. L'application offre une interface intuitive de type Kanban, des tableaux de bord analytiques et une collaboration en temps réel.

### Points forts
- ✅ **Architecture App Shell** - Interface moderne avec barre de navigation globale persistante
- ✅ **Temps réel** - Synchronisation instantanée via Firebase Firestore
- ✅ **Animations fluides** - Transitions et effets visuels professionnels
- ✅ **Responsive** - Optimisé pour desktop et mobile
- ✅ **Sécurisé** - Authentification Firebase et contrôle d'accès par projet

---

## ✨ Fonctionnalités principales

### 🔐 Authentification et sécurité
- **Inscription/Connexion** - Système d'authentification Firebase complet
- **Réinitialisation de mot de passe** - Envoi d'email de récupération
- **Page d'accueil publique** - Accessible sans authentification
- **Barre de navigation globale** - Affichage dynamique (Connexion/Inscription pour invités, Avatar/Déconnexion pour utilisateurs authentifiés)
- **Contrôle d'accès** - Redirection automatique vers login pour les sections protégées

### 📁 Gestion de projets

#### Création et configuration
- **Création de projet** - Formulaire avec nom, description, code d'accès et date limite
- **Code d'accès sécurisé** - Protection par code secret (minimum 4 caractères)
- **Date limite** - Suivi des échéances avec calcul automatique des jours restants
- **Système de membres** - Ajout automatique des utilisateurs lors de l'accès au projet

#### Organisation et affichage
- **Liste des projets** - Vue en grille avec cartes détaillées
- **Statistiques** - Affichage du total, projets créés et projets partagés
- **Informations projet** - Clé unique (PRJ-XX), créateur, date de création
- **Suppression** - Disponible uniquement pour le créateur du projet
- **Animations** - Apparition en cascade des cartes de projet

### 📊 Vue d'ensemble du projet (Vue par défaut)

Lorsqu'un utilisateur accède à un projet, la vue d'ensemble s'affiche automatiquement avec :

#### Statistiques clés
- **Total des tâches** - Nombre total de tâches dans le projet
- **Tâches terminées** - Compteur avec code couleur vert
- **Jours restants** - Calcul intelligent :
  - Affichage du nombre de jours si dans le futur
  - "Today" en orange si échéance aujourd'hui
  - "Overdue" en rouge si dépassé
  - "N/A" si aucune date limite

#### Équipe
- **Propriétaire du projet** - Badge "Owner" avec avatar
- **Membres** - Liste complète avec avatars et badge "Member"
- **Avatars personnalisés** - Initiales colorées ou photos de profil

#### Activité récente
- **5 dernières tâches** - Triées par date de modification
- **Indicateurs de statut** - Pastilles colorées (bleu/orange/vert)
- **Assignation** - Avatar de la personne assignée

### 📋 Tableau Kanban

#### Structure
- **3 colonnes** - "To Do", "In Progress", "Done"
- **Drag & Drop** - Déplacement fluide des tâches entre colonnes
- **Mise à jour automatique** - Changement de statut lors du déplacement

#### Gestion des tâches
- **Création** - Formulaire complet avec :
  - Titre (minimum 3 caractères)
  - Description
  - Statut
  - Priorité (Low, Medium, High)
  - Assignation (membres du projet uniquement)
- **Modification** - Édition complète de toutes les propriétés
- **Suppression** - Avec confirmation
- **Validation** - Contrôles de saisie en temps réel

#### Filtres et tri
- **Recherche par nom** - Filtrage instantané
- **Filtre par créateur** - Dropdown avec tous les membres
- **Tri par date** - Récent ou ancien en premier

### 📅 Calendrier
- **Vue mensuelle** - Grille calendrier complète
- **Tâches par jour** - Affichage des tâches avec code couleur par statut
- **Indicateur de priorité** - Bordure rouge pour tâches haute priorité
- **Interaction** - Clic sur tâche pour éditer, clic sur jour pour créer

### 📈 Rapports et analytiques

#### KPIs
- Total des tâches
- Tâches terminées
- Tâches en cours
- Taux de réalisation (%)

#### Graphiques
- **Distribution des statuts** - Graphique en donut (Chart.js)
- **Charge de travail** - Graphique en barres par membre

#### Charge de travail détaillée
- Liste des membres avec :
  - Avatar et nom
  - Total des tâches assignées
  - Répartition To Do / In Progress
- Tri par charge décroissante

### 👤 Profil utilisateur

#### Informations personnelles
- **Avatar** - Upload de photo de profil (Firebase Storage)
- **Nom d'utilisateur** - Modification en temps réel
- **Email** - Affichage (non modifiable)
- **Badge de rôle** - "Administrateur"

#### Statistiques globales
- **Performance multi-projets** - Agrégation de toutes les tâches assignées
- **Compteurs** - To Do, In Progress, Done
- **Graphique** - Visualisation en donut de la répartition

### 🎨 Interface utilisateur

#### Design System
- **Couleurs** - Palette Slate/Gray avec accents Indigo
- **Statuts** - Bleu (To Do), Orange (In Progress), Vert (Done)
- **Typographie** - Police Inter avec optimisations
- **Icônes** - Lucide Icons pour cohérence visuelle

#### Layout
- **App Shell** - Barre de navigation fixe en haut (64px)
- **Sidebar** - Navigation latérale fixe (256px)
- **Sous-menu projet** - Expansion/collapse animé
- **Contenu principal** - Zone scrollable avec en-têtes de page

#### Animations
- **Transitions de vue** - Fade in + slide up (0.4s)
- **Sous-menu** - Expansion fluide avec max-height
- **Items de menu** - Apparition en cascade avec délais
- **Cartes projet** - Animation staggered (0.05s par carte)
- **Hover effects** - Élévation et changements de couleur
- **Drag & Drop** - Rotation et scale lors du déplacement

### ⚡ Temps réel

#### Synchronisation Firebase
- **Projets** - Listeners Firestore avec mise à jour instantanée
- **Tâches** - Synchronisation en temps réel par projet
- **Utilisateurs** - Profils et avatars synchronisés
- **Membres** - Ajout automatique via arrayUnion

#### Gestion d'état
- **State global** - Module centralisé pour toutes les données
- **Réactivité** - Re-render automatique lors des changements
- **Optimisation** - Unsubscribe des listeners lors du changement de vue

---

## 🛠️ Technologies utilisées

### Frontend
- **HTML5** - Structure sémantique
- **CSS3** - Styles personnalisés et animations
- **JavaScript ES6+** - Modules, async/await, destructuring
- **Tailwind CSS** - Framework CSS utility-first (via CDN)
- **Lucide Icons** - Bibliothèque d'icônes moderne

### Backend & Services
- **Node.js** - Serveur Express
- **Firebase Authentication** - Gestion des utilisateurs
- **Firebase Firestore** - Base de données NoSQL temps réel
- **Firebase Storage** - Stockage des avatars

### Bibliothèques
- **Chart.js** - Graphiques et visualisations
- **Firebase SDK 11.6.1** - Intégration complète

---

## 📂 Architecture du projet

```
TaskFlow/
├── .gitignore
├── README.md
├── ROADMAP.md
├── package.json
├── server.js                    # Serveur Express
├── index.html                   # Structure HTML principale
└── src/
    ├── css/
    │   └── style.css           # Styles personnalisés et animations
    └── js/
        ├── main.js             # Point d'entrée, gestion auth
        ├── utils.js            # Fonctions utilitaires (toasts, avatars)
        ├── config.js           # Configuration Tailwind
        ├── core/
        │   ├── dom.js          # Sélecteurs DOM centralisés
        │   ├── firebase.js     # Configuration Firebase
        │   └── state.js        # Gestion d'état global
        └── modules/
            ├── auth.js         # Logique d'authentification
            ├── headerAuth.js   # UI d'authentification globale
            ├── navigation.js   # Navigation sidebar et vues
            ├── projects.js     # CRUD projets
            ├── kanban.js       # Tableau Kanban et tâches
            ├── summary.js      # Vue d'ensemble projet
            ├── profile.js      # Gestion profil utilisateur
            └── dashboard.js    # Analytics (legacy)
```

### Architecture modulaire
- **Séparation des préoccupations** - Chaque module a une responsabilité unique
- **Imports ES6** - Dépendances explicites entre modules
- **State centralisé** - Source unique de vérité
- **DOM centralisé** - Références DOM réutilisables

---

## 🚀 Installation et configuration

### Prérequis
- Node.js 18+ installé
- Compte Firebase avec projet configuré
- Git pour cloner le repository

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/ZouhairChoufa/kanban-project-manager-Mini_jira.git
cd kanban-project-manager-Mini_jira
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer Firebase**

Créez un projet Firebase :
- Accédez à [Firebase Console](https://console.firebase.google.com/)
- Créez un nouveau projet
- Activez Authentication (Email/Password)
- Créez une base Firestore
- Activez Firebase Storage

Copiez votre configuration Firebase dans `src/js/core/firebase.js` :

```javascript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};
```

4. **Configurer les règles Firestore**

Dans Firebase Console > Firestore > Règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /artifacts/{appId}/public/data/projects/{projectId} {
      allow read, create: if request.auth != null;
      allow update: if request.auth != null && request.auth.uid in resource.data.members;
      allow delete: if request.auth != null && request.auth.uid == resource.data.createdById;
      
      match /tasks/{taskId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

5. **Démarrer le serveur**
```bash
npm start
```

6. **Accéder à l'application**
Ouvrez votre navigateur : [http://localhost:3000](http://localhost:3000)

---

## 📖 Guide d'utilisation

### Premiers pas

1. **Page d'accueil** - Découvrez les fonctionnalités sans authentification
2. **Inscription** - Cliquez sur "S'inscrire" dans la barre de navigation
3. **Connexion** - Utilisez "Connexion" pour accéder à votre compte

### Créer un projet

1. Cliquez sur "Projects" dans la sidebar
2. Cliquez sur "Créer un projet" (bouton indigo en haut à droite)
3. Remplissez le formulaire :
   - Nom du projet (min 3 caractères)
   - Description
   - Code d'accès (min 4 caractères)
   - Date limite
4. Cliquez sur "Créer"

### Accéder à un projet

1. Cliquez sur une carte de projet
2. Entrez le code d'accès
3. Vous êtes automatiquement ajouté comme membre
4. La vue d'ensemble s'affiche par défaut

### Gérer les tâches

1. Dans un projet, naviguez vers "Board"
2. Cliquez sur "Create" pour créer une tâche
3. Remplissez les détails et assignez à un membre
4. Glissez-déposez les tâches entre colonnes
5. Cliquez sur une tâche pour l'éditer ou la supprimer

### Utiliser les vues

- **Vue d'ensemble** - Statistiques et activité du projet
- **Board** - Tableau Kanban avec drag & drop
- **Calendar** - Vue calendrier des tâches
- **Reports** - Analytiques et graphiques

---

## 🔒 Sécurité

### Authentification
- Firebase Authentication pour gestion sécurisée des utilisateurs
- Tokens JWT automatiques
- Sessions persistantes

### Contrôle d'accès
- Code d'accès requis pour rejoindre un projet
- Seul le créateur peut supprimer un projet
- Règles Firestore pour validation côté serveur
- Vérification des permissions avant chaque opération

### Bonnes pratiques
- Pas de données sensibles côté client
- Validation des entrées utilisateur
- Sanitization des données
- HTTPS recommandé en production

---

## 🎨 Personnalisation

### Couleurs
Modifiez les couleurs dans `src/css/style.css` ou via Tailwind :
- Primary: `indigo-600`
- Success: `green-600`
- Warning: `orange-600`
- Danger: `red-600`

### Animations
Ajustez les durées dans `style.css` :
```css
transition-duration: 150ms; /* Modifier selon besoin */
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Suivez ces étapes :

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/NouvelleFonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout NouvelleFonctionnalite'`)
4. Push vers la branche (`git push origin feature/NouvelleFonctionnalite`)
5. Ouvrez une Pull Request

---

## 📝 License

Ce projet est sous licence ISC. Voir le fichier LICENSE pour plus de détails.

---

## 📧 Contact

**Zouhair Choufa**
- Email: zouhair.choufa3@gmail.com
- GitHub: [@ZouhairChoufa](https://github.com/ZouhairChoufa)
- LinkedIn: [Zouhair Choufa](https://linkedin.com/in/zouhair-choufa)

---

## 🙏 Remerciements

- **Firebase** - Infrastructure backend complète
- **Tailwind CSS** - Framework CSS moderne
- **Lucide Icons** - Icônes élégantes
- **Chart.js** - Visualisations de données
- **Jira** - Inspiration pour le design

---

## 📊 Statistiques du projet

- **Lignes de code** : ~5000+
- **Modules JavaScript** : 10
- **Vues** : 7 (Home, Projects, Summary, Board, Calendar, Reports, Profile)
- **Animations** : 15+
- **Temps de développement** : 3 mois

---

**Fait avec ❤️ par Zouhair Choufa**

*TaskFlow - Gérez vos projets comme un pro*
