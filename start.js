const { initDatabase } = require('./server/database');

// Initialiser la base de données avant de démarrer le serveur
async function startServer() {
  try {
    console.log('Initialisation de la base de données...');
    await initDatabase();
    console.log('Base de données initialisée avec succès');
    
    // Démarrer le serveur Express
    require('./server/index.js');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

startServer(); 