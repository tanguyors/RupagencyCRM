const express = require('express');
const { query, queryOne, run } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Fonction pour transformer les données DB (PG/SQLite) en format frontend
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
  googleRating: row.google_rating,
  googleReviewsCount: row.google_reviews_count,
  status: row.status,
  assignedTo: row.assigned_to,
  createdAt: row.created_at,
  // PG renvoie "assignedtoname" (alias sans underscore), SQLite renvoie "assignedToName" si on le quote.
  assignedToName: row.assignedtoname || row.assignedToName
});

// Récupérer toutes les entreprises
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sql = `
      SELECT c.*, u.name as assignedToName 
      FROM companies c 
      LEFT JOIN users u ON c.assigned_to = u.id 
      ORDER BY c.created_at DESC
    `;
    
    const result = await query(sql);
    const transformedCompanies = result.rows.map(transformCompanyData);
    res.json(transformedCompanies);
  } catch (err) {
    console.error('Erreur lors de la récupération des entreprises:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération des entreprises' });
  }
});

// Récupérer une entreprise par ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT c.*, u.name as assignedToName 
      FROM companies c 
      LEFT JOIN users u ON c.assigned_to = u.id 
      WHERE c.id = ?
    `;
    
    const company = await queryOne(sql, [id]);
    if (!company) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }
    
    const transformedCompany = transformCompanyData(company);
    res.json(transformedCompany);
  } catch (err) {
    console.error('Erreur lors de la récupération de l\'entreprise:', err);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'entreprise' });
  }
});

// Créer une nouvelle entreprise
router.post('/', authenticateToken, async (req, res) => {
  try {
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
      googleRating,
      googleReviewsCount,
      status,
      assignedTo
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de l\'entreprise est obligatoire' });
    }

    // Normaliser les champs numériques (éviter d'insérer des chaînes vides)
    const normalizedGoogleRating =
      googleRating === undefined || googleRating === null || `${googleRating}`.trim() === ''
        ? null
        : parseFloat(googleRating);
    const normalizedGoogleReviewsCount =
      googleReviewsCount === undefined || googleReviewsCount === null || `${googleReviewsCount}`.trim() === ''
        ? null
        : parseInt(googleReviewsCount, 10);

    const insertSql = `
      INSERT INTO companies (
        name, phone, city, postal_code, country, siren, manager, 
        sector, email, website, size, notes, google_rating, google_reviews_count, status, assigned_to
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name, phone, city, postalCode, country, siren, manager,
      sector, email, website, size, notes, normalizedGoogleRating, normalizedGoogleReviewsCount, status || 'Prospect', assignedTo || null
    ];

    // En PG, pour récupérer l'id inséré on utilise RETURNING id
    const isProd = process.env.NODE_ENV === 'production';
    let insertedId;
    if (isProd) {
      const returning = await queryOne(
        `INSERT INTO companies (
           name, phone, city, postal_code, country, siren, manager,
           sector, email, website, size, notes, google_rating, google_reviews_count, status, assigned_to
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        values
      );
      insertedId = returning?.id;
    } else {
      const result = await run(insertSql, values);
      insertedId = result.lastID;
    }

    // Récupérer l'entreprise avec le nom de l'utilisateur assigné
    const selectSql = `
      SELECT c.*, u.name as assignedToName 
      FROM companies c 
      LEFT JOIN users u ON c.assigned_to = u.id 
      WHERE c.id = ?
    `;
    
    const company = await queryOne(selectSql, [insertedId]);
    const transformedCompany = transformCompanyData(company);
    res.status(201).json(transformedCompany);
  } catch (err) {
    console.error('Erreur lors de la création de l\'entreprise:', err);
    res.status(500).json({ message: 'Erreur lors de la création de l\'entreprise' });
  }
});

// Mettre à jour une entreprise
router.put('/:id', authenticateToken, async (req, res) => {
  try {
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
      googleRating,
      googleReviewsCount,
      status,
      assignedTo
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de l\'entreprise est obligatoire' });
    }

    // Normaliser les champs numériques (éviter d'insérer des chaînes vides)
    const normalizedGoogleRating =
      googleRating === undefined || googleRating === null || `${googleRating}`.trim() === ''
        ? null
        : parseFloat(googleRating);
    const normalizedGoogleReviewsCount =
      googleReviewsCount === undefined || googleReviewsCount === null || `${googleReviewsCount}`.trim() === ''
        ? null
        : parseInt(googleReviewsCount, 10);

    const updateSql = `
      UPDATE companies SET 
        name = ?, phone = ?, city = ?, postal_code = ?, country = ?, 
        siren = ?, manager = ?, sector = ?, email = ?, website = ?, 
        size = ?, notes = ?, google_rating = ?, google_reviews_count = ?, status = ?, assigned_to = ?
      WHERE id = ?
    `;

    const values = [
      name, phone, city, postalCode, country, siren, manager,
      sector, email, website, size, notes, normalizedGoogleRating, normalizedGoogleReviewsCount, status, assignedTo || null, id
    ];

    const result = await run(updateSql, values);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }

    // Récupérer l'entreprise mise à jour
    const selectSql = `
      SELECT c.*, u.name as assignedToName 
      FROM companies c 
      LEFT JOIN users u ON c.assigned_to = u.id 
      WHERE c.id = ?
    `;
    
    const company = await queryOne(selectSql, [id]);
    const transformedCompany = transformCompanyData(company);
    res.json(transformedCompany);
  } catch (err) {
    console.error('Erreur lors de la mise à jour de l\'entreprise:', err);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entreprise' });
  }
});

// Supprimer une entreprise
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await run('DELETE FROM companies WHERE id = ?', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Entreprise non trouvée' });
    }
    
    res.json({ message: 'Entreprise supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de l\'entreprise:', err);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'entreprise' });
  }
});

// Rechercher des entreprises
router.get('/search/:term', authenticateToken, async (req, res) => {
  try {
    const { term } = req.params;
    const searchTerm = `%${term}%`;

    const sql = `
      SELECT c.*, u.name as assignedToName 
      FROM companies c 
      LEFT JOIN users u ON c.assigned_to = u.id 
      WHERE c.name LIKE ? OR c.city LIKE ? OR c.sector LIKE ? OR c.manager LIKE ?
      ORDER BY c.created_at DESC
    `;

    const result = await query(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);
    const transformedCompanies = result.rows.map(transformCompanyData);
    res.json(transformedCompanies);
  } catch (err) {
    console.error('Erreur lors de la recherche:', err);
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
});

module.exports = router; 