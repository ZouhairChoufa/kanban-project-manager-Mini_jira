// Fichier: server.js
// Un serveur Express simple pour servir notre application statique.

const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// 1. Définir le chemin vers nos fichiers statiques (le dossier racine)
const publicPath = path.join(__dirname);

// 2. Utiliser le middleware express.static
// Il interceptera les requêtes pour les fichiers (ex: /src/js/main.js)
// et les servira automatiquement.
app.use(express.static(publicPath));

// 3. Une route "catch-all"
// Pour toute requête qui n'est PAS un fichier statique (ex: '/'),
// renvoyer notre fichier index.html.
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 4. Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur TaskFlow Kanban démarré sur http://localhost:${port}`);
});