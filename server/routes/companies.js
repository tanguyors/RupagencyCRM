const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Récupérer toutes les entreprises
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT c.*, u.name as assignedToName 
    FROM companies c 
    LEFT JOIN users u ON c.assignedTo = u.id 
    ORDER BY c.createdAt DESC
  `;
  
  pool.query(query)
    .then(result => {
      res.json(result.rows);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des entreprises:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des entreprises' });
    });
});

// Récupérer une entreprise par ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT c.*, u.name as assignedToName 
    FROM companies c 
    LEFT JOIN users u ON c.assignedTo = u.id 
    WHERE c.id = ?
  `;
  
  pool.query(query, [id])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Entreprise non trouvée' });
      }
      res.json(result.rows[0]);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération de l\'entreprise:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'entreprise' });
    });
});

// Créer une nouvelle entreprise
router.post('/', authenticateToken, (req, res) => {
  const {
    name,
    phone,
    city,
    postalCode,
    country,
    siren,
    manager,
    sector,
    email,
    website,
    size,
    notes,
    status,
    assignedTo
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Le nom de l\'entreprise est obligatoire' });
  }

  const query = `
    INSERT INTO companies (
      name, phone, city, postalCode, country, siren, manager, 
      sector, email, website, size, notes, status, assignedTo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name, phone, city, postalCode, country, siren, manager,
    sector, email, website, size, notes, status || 'Prospect', assignedTo
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la création de l\'entreprise' });
    }

    // Récupérer l'entreprise créée
    db.get(`
      SELECT c.*, u.name as assignedToName 
      FROM companies c 
      LEFT JOIN users u ON c.assignedTo = u.id 
      WHERE c.id = ?
    `, [this.lastID], (err, company) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'entreprise créée' });
      }
      res.status(201).json(company);
    });
  });
});

// Mettre à jour une entreprise
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    name,
    phone,
    city,
    postalCode,
    country,
    siren,
    manager,
    sector,
    email,
    website,
    size,
    notes,
    status,
    assignedTo
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Le nom de l\'entreprise est obligatoire' });
  }

  const query = `
    UPDATE companies SET 
      name = ?, phone = ?, city = ?, postalCode = ?, country = ?, 
      siren = ?, manager = ?, sector = ?, email = ?, website = ?, 
      size = ?, notes = ?, status = ?, assignedTo = ?
    WHERE id = ?
  `;

  const values = [
    name, phone, city, postalCode, country, siren, manager,
    sector, email, website, size, notes, status, assignedTo, id
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entreprise' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Récupérer l'entreprise mise à jour
    db.get(`
      SELECT c.*, u.name as assignedToName 
      FROM companies c 
      LEFT JOIN users u ON c.assignedTo = u.id 
      WHERE c.id = ?
    `, [id], (err, company) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'entreprise mise à jour' });
      }
      res.json(company);
    });
  });
});

// Supprimer une entreprise
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM companies WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression de l\'entreprise' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    res.json({ message: 'Entreprise supprimée avec succès' });
  });
});

// Rechercher des entreprises
router.get('/search/:term', authenticateToken, (req, res) => {
  const { term } = req.params;
  const searchTerm = `%${term}%`;

  const query = `
    SELECT c.*, u.name as assignedToName 
    FROM companies c 
    LEFT JOIN users u ON c.assignedTo = u.id 
    WHERE c.name LIKE ? OR c.city LIKE ? OR c.sector LIKE ? OR c.manager LIKE ?
    ORDER BY c.createdAt DESC
  `;

  db.all(query, [searchTerm, searchTerm, searchTerm, searchTerm], (err, companies) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la recherche' });
    }
    res.json(companies);
  });
});

module.exports = router; 