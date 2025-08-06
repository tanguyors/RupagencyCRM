const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { router: authRoutes } = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const callsRoutes = require('./routes/calls');
const appointmentsRoutes = require('./routes/appointments');
const usersRoutes = require('./routes/users');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// Utiliser PostgreSQL en production, SQLite en développement
const { initDatabase } = process.env.NODE_ENV === 'production' 
  ? require('./database-postgres')
  : require('./database');

// Initialiser la base de données
initDatabase().then(() => {
  console.log('Base de données initialisée avec succès');
}).catch(err => {
  console.error('Erreur lors de l\'initialisation de la base de données:', err);
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '../build')));

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 