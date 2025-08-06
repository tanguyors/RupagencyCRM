const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Récupérer tous les appels
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT c.*, co.name as companyName, u.name as userName 
    FROM calls c 
    LEFT JOIN companies co ON c.companyId = co.id 
    LEFT JOIN users u ON c.userId = u.id 
    ORDER BY c.scheduledDateTime DESC
  `;
  
  db.all(query, (err, calls) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des appels' });
    }
    res.json(calls);
  });
});

// Récupérer un appel par ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT c.*, co.name as companyName, u.name as userName 
    FROM calls c 
    LEFT JOIN companies co ON c.companyId = co.id 
    LEFT JOIN users u ON c.userId = u.id 
    WHERE c.id = ?
  `;
  
  db.get(query, [id], (err, call) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération de l\'appel' });
    }
    
    if (!call) {
      return res.status(404).json({ message: 'Appel non trouvé' });
    }
    
    res.json(call);
  });
});

// Créer un nouvel appel
router.post('/', authenticateToken, (req, res) => {
  const {
    companyId,
    type,
    scheduledDateTime,
    notes,
    priority,
    status,
    userId
  } = req.body;

  if (!companyId || !type || !scheduledDateTime) {
    return res.status(400).json({ message: 'CompanyId, type et scheduledDateTime sont obligatoires' });
  }

  const query = `
    INSERT INTO calls (companyId, type, scheduledDateTime, notes, priority, status, userId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    companyId, type, scheduledDateTime, notes, priority || 'Normal', status || 'Programmé', userId
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la création de l\'appel' });
    }

    // Récupérer l'appel créé
    db.get(`
      SELECT c.*, co.name as companyName, u.name as userName 
      FROM calls c 
      LEFT JOIN companies co ON c.companyId = co.id 
      LEFT JOIN users u ON c.userId = u.id 
      WHERE c.id = ?
    `, [this.lastID], (err, call) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'appel créé' });
      }
      res.status(201).json(call);
    });
  });
});

// Mettre à jour un appel
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    companyId,
    type,
    scheduledDateTime,
    notes,
    priority,
    status,
    userId
  } = req.body;

  if (!companyId || !type || !scheduledDateTime) {
    return res.status(400).json({ message: 'CompanyId, type et scheduledDateTime sont obligatoires' });
  }

  const query = `
    UPDATE calls SET 
      companyId = ?, type = ?, scheduledDateTime = ?, notes = ?, 
      priority = ?, status = ?, userId = ?
    WHERE id = ?
  `;

  const values = [
    companyId, type, scheduledDateTime, notes, priority, status, userId, id
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'appel' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Appel non trouvé' });
    }

    // Récupérer l'appel mis à jour
    db.get(`
      SELECT c.*, co.name as companyName, u.name as userName 
      FROM calls c 
      LEFT JOIN companies co ON c.companyId = co.id 
      LEFT JOIN users u ON c.userId = u.id 
      WHERE c.id = ?
    `, [id], (err, call) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'appel mis à jour' });
      }
      res.json(call);
    });
  });
});

// Supprimer un appel
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM calls WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression de l\'appel' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Appel non trouvé' });
    }

    res.json({ message: 'Appel supprimé avec succès' });
  });
});

// Récupérer les appels par entreprise
router.get('/company/:companyId', authenticateToken, (req, res) => {
  const { companyId } = req.params;
  
  const query = `
    SELECT c.*, co.name as companyName, u.name as userName 
    FROM calls c 
    LEFT JOIN companies co ON c.companyId = co.id 
    LEFT JOIN users u ON c.userId = u.id 
    WHERE c.companyId = ?
    ORDER BY c.scheduledDateTime DESC
  `;
  
  db.all(query, [companyId], (err, calls) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des appels' });
    }
    res.json(calls);
  });
});

module.exports = router; 