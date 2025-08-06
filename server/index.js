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
const { initDatabase } = require('./database');

// Initialiser la base de données
initDatabase().then(() => {
  console.log('Base de données initialisée avec succès');
}).catch(err => {
  console.error('Erreur lors de l\'initialisation de la base de données:', err);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../build')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/stats', statsRoutes);

// Serve React app for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 