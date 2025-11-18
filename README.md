Projet TaskFlow Kanban

Ceci est une application web de type tableau Kanban, simple et modulaire, alimentée par Firebase. Elle permet aux utilisateurs de créer des comptes, de gérer des projets et de suivre des tâches à travers les colonnes "To Do", "In Progress", et "Done".

Fonctionnalités

Authentification : Inscription et connexion des utilisateurs (Firebase Auth).

Gestion de Projets :

Créer des projets avec un nom, une description et un code d'accès secret.

Accéder à un projet en fournissant son code d'accès.

Tableau Kanban :

Pour chaque projet, un tableau Kanban dédié.

CRUD (Créer, Lire, Mettre à jour, Supprimer) complet pour les tâches.

Assigner des tâches aux utilisateurs.

Glisser-déposer (Drag and drop) pour changer le statut des tâches.

Tableau de Bord Analytique :

Statistiques par projet sur le temps de complétion moyen.

Visualisation de la charge de travail par personne (tâches assignées).

Gestion de Profil :

Mettre à jour le nom d'utilisateur.

Télécharger une photo de profil (Firebase Storage).

Réinitialiser le mot de passe.

Mises à jour en temps réel : Utilise Firestore pour refléter tous les changements instantanément.

Structure du Projet (Modulaire)

L'application est organisée en modules JavaScript pour une meilleure lisibilité et maintenance.

TaskFlow-Kanban/
├── .gitignore
├── README.md
├── index.html          (Structure HTML principale)
├── package.json        (Dépendances du serveur Node.js)
├── server.js           (Serveur Node.js/Express pour servir les fichiers)
└── src/
    ├── css/
    │   └── styles.css  (Styles CSS personnalisés)
    └── js/
        ├── config.js         (Configuration de Tailwind CSS)
        ├── main.js           (Point d'entrée, "chef d'orchestre")
        ├── utils.js          (Fonctions utilitaires: toasts, avatars, etc.)
        ├── core/
        │   ├── dom.js        (Sélecteurs DOM)
        │   ├── firebase.js   (Initialisation de Firebase)
        │   └── state.js      (Gestion de l'état global)
        └── modules/
            ├── auth.js       (Logique d'authentification)
            ├── dashboard.js  (Logique du tableau de bord)
            ├── kanban.js     (Logique du tableau Kanban)
            ├── profile.js    (Logique du modal de profil)
            └── projects.js   (Logique de la page des projets)


Comment Lancer (Localement)

Ce projet utilise un simple serveur Node.js/Express pour servir les fichiers statiques.

Prérequis : Assurez-vous d'avoir Node.js installé sur votre machine.

Installer les dépendances :
Ouvrez un terminal dans le dossier racine du projet (TaskFlow-Kanban/) et exécutez :

npm install


(Cela n'installera que express.)

Démarrer le serveur :
Dans le même terminal, exécutez :

npm start


Ouvrir l'application :
Ouvrez votre navigateur et allez à l'adresse http://localhost:3000.