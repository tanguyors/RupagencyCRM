const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Récupérer tous les rendez-vous
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.companyId = c.id 
    LEFT JOIN users u ON a.userId = u.id 
    ORDER BY a.date DESC
  `;
  
  db.all(query, (err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous' });
    }
    res.json(appointments);
  });
});

// Récupérer un rendez-vous par ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.companyId = c.id 
    LEFT JOIN users u ON a.userId = u.id 
    WHERE a.id = ?
  `;
  
  db.get(query, [id], (err, appointment) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération du rendez-vous' });
    }
    
    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    
    res.json(appointment);
  });
});

// Créer un nouveau rendez-vous
router.post('/', authenticateToken, (req, res) => {
  const {
    companyId,
    date,
    briefing,
    status,
    userId
  } = req.body;

  if (!companyId || !date) {
    return res.status(400).json({ message: 'CompanyId et date sont obligatoires' });
  }

  const query = `
    INSERT INTO appointments (companyId, date, briefing, status, userId)
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    companyId, date, briefing, status || 'En attente', userId
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la création du rendez-vous' });
    }

    // Récupérer le rendez-vous créé
    db.get(`
      SELECT a.*, c.name as companyName, u.name as userName 
      FROM appointments a 
      LEFT JOIN companies c ON a.companyId = c.id 
      LEFT JOIN users u ON a.userId = u.id 
      WHERE a.id = ?
    `, [this.lastID], (err, appointment) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération du rendez-vous créé' });
      }
      res.status(201).json(appointment);
    });
  });
});

// Mettre à jour un rendez-vous
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    companyId,
    date,
    briefing,
    status,
    userId
  } = req.body;

  if (!companyId || !date) {
    return res.status(400).json({ message: 'CompanyId et date sont obligatoires' });
  }

  const query = `
    UPDATE appointments SET 
      companyId = ?, date = ?, briefing = ?, status = ?, userId = ?
    WHERE id = ?
  `;

  const values = [
    companyId, date, briefing, status, userId, id
  ];

  db.run(query, values, function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du rendez-vous' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    // Récupérer le rendez-vous mis à jour
    db.get(`
      SELECT a.*, c.name as companyName, u.name as userName 
      FROM appointments a 
      LEFT JOIN companies c ON a.companyId = c.id 
      LEFT JOIN users u ON a.userId = u.id 
      WHERE a.id = ?
    `, [id], (err, appointment) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération du rendez-vous mis à jour' });
      }
      res.json(appointment);
    });
  });
});

// Supprimer un rendez-vous
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression du rendez-vous' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }

    res.json({ message: 'Rendez-vous supprimé avec succès' });
  });
});

// Récupérer les rendez-vous par entreprise
router.get('/company/:companyId', authenticateToken, (req, res) => {
  const { companyId } = req.params;
  
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.companyId = c.id 
    LEFT JOIN users u ON a.userId = u.id 
    WHERE a.companyId = ?
    ORDER BY a.date DESC
  `;
  
  db.all(query, [companyId], (err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous' });
    }
    res.json(appointments);
  });
});

// Récupérer les rendez-vous du jour
router.get('/today', authenticateToken, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.companyId = c.id 
    LEFT JOIN users u ON a.userId = u.id 
    WHERE DATE(a.date) = ?
    ORDER BY a.date ASC
  `;
  
  db.all(query, [today], (err, appointments) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous du jour' });
    }
    res.json(appointments);
  });
});

module.exports = router; 