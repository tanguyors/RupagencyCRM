const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Fonction pour transformer les données PostgreSQL en format frontend
const transformCompanyData = (row) => ({
  id: row.id,
  name: row.name,
  phone: row.phone,
  city: row.city,
  postalCode: row.postal_code,
  country: row.country,
  siren: row.siren,
  manager: row.manager,
  sector: row.sector,
  email: row.email,
  website: row.website,
  size: row.size,
  notes: row.notes,
  status: row.status,
  assignedTo: row.assigned_to,
  createdAt: row.created_at,
  assignedToName: row.assignedtoname
});

// Récupérer toutes les entreprises
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT c.*, u.name as assignedToName 
    FROM companies c 
    LEFT JOIN users u ON c.assigned_to = u.id 
    ORDER BY c.created_at DESC
  `;
  
  pool.query(query)
    .then(result => {
      const transformedCompanies = result.rows.map(transformCompanyData);
      res.json(transformedCompanies);
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
    LEFT JOIN users u ON c.assigned_to = u.id 
    WHERE c.id = $1
  `;
  
  pool.query(query, [id])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Entreprise non trouvée' });
      }
      const transformedCompany = transformCompanyData(result.rows[0]);
      res.json(transformedCompany);
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
      name, phone, city, postal_code, country, siren, manager, 
      sector, email, website, size, notes, status, assigned_to
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *
  `;

  const values = [
    name, phone, city, postalCode, country, siren, manager,
    sector, email, website, size, notes, status || 'Prospect', assignedTo
  ];

  pool.query(query, values)
    .then(result => {
      const company = result.rows[0];
      
      // Récupérer l'entreprise avec le nom de l'utilisateur assigné
      return pool.query(`
        SELECT c.*, u.name as assignedToName 
        FROM companies c 
        LEFT JOIN users u ON c.assigned_to = u.id 
        WHERE c.id = $1
      `, [company.id]);
    })
    .then(result => {
      const transformedCompany = transformCompanyData(result.rows[0]);
      res.status(201).json(transformedCompany);
    })
    .catch(err => {
      console.error('Erreur lors de la création de l\'entreprise:', err);
      res.status(500).json({ message: 'Erreur lors de la création de l\'entreprise' });
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
      name = $1, phone = $2, city = $3, postal_code = $4, country = $5, 
      siren = $6, manager = $7, sector = $8, email = $9, website = $10, 
      size = $11, notes = $12, status = $13, assigned_to = $14
    WHERE id = $15
  `;

  const values = [
    name, phone, city, postalCode, country, siren, manager,
    sector, email, website, size, notes, status, assignedTo, id
  ];

  pool.query(query, values)
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Entreprise non trouvée' });
      }

      // Récupérer l'entreprise mise à jour
      return pool.query(`
        SELECT c.*, u.name as assignedToName 
        FROM companies c 
        LEFT JOIN users u ON c.assigned_to = u.id 
        WHERE c.id = $1
      `, [id]);
    })
    .then(result => {
      const transformedCompany = transformCompanyData(result.rows[0]);
      res.json(transformedCompany);
    })
    .catch(err => {
      console.error('Erreur lors de la mise à jour de l\'entreprise:', err);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entreprise' });
    });
});

// Supprimer une entreprise
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM companies WHERE id = $1', [id])
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Entreprise non trouvée' });
      }
      res.json({ message: 'Entreprise supprimée avec succès' });
    })
    .catch(err => {
      console.error('Erreur lors de la suppression de l\'entreprise:', err);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'entreprise' });
    });
});

// Rechercher des entreprises
router.get('/search/:term', authenticateToken, (req, res) => {
  const { term } = req.params;
  const searchTerm = `%${term}%`;

  const query = `
    SELECT c.*, u.name as assignedToName 
    FROM companies c 
    LEFT JOIN users u ON c.assigned_to = u.id 
    WHERE c.name ILIKE $1 OR c.city ILIKE $1 OR c.sector ILIKE $1 OR c.manager ILIKE $1
    ORDER BY c.created_at DESC
  `;

  pool.query(query, [searchTerm])
    .then(result => {
      const transformedCompanies = result.rows.map(transformCompanyData);
      res.json(transformedCompanies);
    })
    .catch(err => {
      console.error('Erreur lors de la recherche:', err);
      res.status(500).json({ message: 'Erreur lors de la recherche' });
    });
});

module.exports = router; 