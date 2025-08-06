const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Fonction pour transformer les données PostgreSQL en format frontend
const transformCallData = (row) => ({
  id: row.id,
  companyId: row.company_id,
  type: row.type,
  scheduledDateTime: row.scheduled_date_time,
  notes: row.notes,
  priority: row.priority,
  status: row.status,
  userId: row.user_id,
  createdAt: row.created_at,
  companyName: row.companyname,
  userName: row.username
});

// Récupérer tous les appels
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT c.*, co.name as companyName, u.name as userName 
    FROM calls c 
    LEFT JOIN companies co ON c.company_id = co.id 
    LEFT JOIN users u ON c.user_id = u.id 
    ORDER BY c.scheduled_date_time DESC
  `;
  
  pool.query(query)
    .then(result => {
      const transformedCalls = result.rows.map(transformCallData);
      res.json(transformedCalls);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des appels:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des appels' });
    });
});

// Récupérer un appel par ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT c.*, co.name as companyName, u.name as userName 
    FROM calls c 
    LEFT JOIN companies co ON c.company_id = co.id 
    LEFT JOIN users u ON c.user_id = u.id 
    WHERE c.id = $1
  `;
  
  pool.query(query, [id])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Appel non trouvé' });
      }
      const transformedCall = transformCallData(result.rows[0]);
      res.json(transformedCall);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération de l\'appel:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'appel' });
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
    INSERT INTO calls (company_id, type, scheduled_date_time, notes, priority, status, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    companyId, type, scheduledDateTime, notes, priority || 'Normal', status || 'Programmé', userId
  ];

  pool.query(query, values)
    .then(result => {
      const call = result.rows[0];
      
      // Récupérer l'appel avec les noms des entités liées
      return pool.query(`
        SELECT c.*, co.name as companyName, u.name as userName 
        FROM calls c 
        LEFT JOIN companies co ON c.company_id = co.id 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.id = $1
      `, [call.id]);
    })
    .then(result => {
      const transformedCall = transformCallData(result.rows[0]);
      res.status(201).json(transformedCall);
    })
    .catch(err => {
      console.error('Erreur lors de la création de l\'appel:', err);
      res.status(500).json({ message: 'Erreur lors de la création de l\'appel' });
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
      company_id = $1, type = $2, scheduled_date_time = $3, notes = $4, 
      priority = $5, status = $6, user_id = $7
    WHERE id = $8
  `;

  const values = [
    companyId, type, scheduledDateTime, notes, priority, status, userId, id
  ];

  pool.query(query, values)
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Appel non trouvé' });
      }

      // Récupérer l'appel mis à jour
      return pool.query(`
        SELECT c.*, co.name as companyName, u.name as userName 
        FROM calls c 
        LEFT JOIN companies co ON c.company_id = co.id 
        LEFT JOIN users u ON c.user_id = u.id 
        WHERE c.id = $1
      `, [id]);
    })
    .then(result => {
      const transformedCall = transformCallData(result.rows[0]);
      res.json(transformedCall);
    })
    .catch(err => {
      console.error('Erreur lors de la mise à jour de l\'appel:', err);
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'appel' });
    });
});

// Supprimer un appel
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM calls WHERE id = $1', [id])
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Appel non trouvé' });
      }
      res.json({ message: 'Appel supprimé avec succès' });
    })
    .catch(err => {
      console.error('Erreur lors de la suppression de l\'appel:', err);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'appel' });
    });
});

// Récupérer les appels par entreprise
router.get('/company/:companyId', authenticateToken, (req, res) => {
  const { companyId } = req.params;
  
  const query = `
    SELECT c.*, co.name as companyName, u.name as userName 
    FROM calls c 
    LEFT JOIN companies co ON c.company_id = co.id 
    LEFT JOIN users u ON c.user_id = u.id 
    WHERE c.company_id = $1
    ORDER BY c.scheduled_date_time DESC
  `;
  
  pool.query(query, [companyId])
    .then(result => {
      const transformedCalls = result.rows.map(transformCallData);
      res.json(transformedCalls);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des appels par entreprise:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des appels par entreprise' });
    });
});

module.exports = router; 