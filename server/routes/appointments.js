const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Fonction pour transformer les données PostgreSQL en format frontend
const transformAppointmentData = (row) => ({
  id: row.id,
  companyId: row.company_id,
  date: row.date,
  briefing: row.briefing,
  status: row.status,
  userId: row.user_id,
  createdAt: row.created_at,
  companyName: row.companyname,
  userName: row.username
});

// Récupérer tous les rendez-vous
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.company_id = c.id 
    LEFT JOIN users u ON a.user_id = u.id 
    ORDER BY a.date DESC
  `;
  
  pool.query(query)
    .then(result => {
      const transformedAppointments = result.rows.map(transformAppointmentData);
      res.json(transformedAppointments);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des rendez-vous:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous' });
    });
});

// Récupérer un rendez-vous par ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.company_id = c.id 
    LEFT JOIN users u ON a.user_id = u.id 
    WHERE a.id = $1
  `;
  
  pool.query(query, [id])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }
      const transformedAppointment = transformAppointmentData(result.rows[0]);
      res.json(transformedAppointment);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération du rendez-vous:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération du rendez-vous' });
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
    INSERT INTO appointments (company_id, date, briefing, status, user_id)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    companyId, date, briefing, status || 'En attente', userId
  ];

  pool.query(query, values)
    .then(result => {
      const appointment = result.rows[0];
      
      // Récupérer le rendez-vous avec les noms des entités liées
      return pool.query(`
        SELECT a.*, c.name as companyName, u.name as userName 
        FROM appointments a 
        LEFT JOIN companies c ON a.company_id = c.id 
        LEFT JOIN users u ON a.user_id = u.id 
        WHERE a.id = $1
      `, [appointment.id]);
    })
    .then(result => {
      const transformedAppointment = transformAppointmentData(result.rows[0]);
      res.status(201).json(transformedAppointment);
    })
    .catch(err => {
      console.error('Erreur lors de la création du rendez-vous:', err);
      res.status(500).json({ message: 'Erreur lors de la création du rendez-vous' });
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
      company_id = $1, date = $2, briefing = $3, status = $4, user_id = $5
    WHERE id = $6
  `;

  const values = [
    companyId, date, briefing, status, userId, id
  ];

  pool.query(query, values)
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }

      // Récupérer le rendez-vous mis à jour
      return pool.query(`
        SELECT a.*, c.name as companyName, u.name as userName 
        FROM appointments a 
        LEFT JOIN companies c ON a.company_id = c.id 
        LEFT JOIN users u ON a.user_id = u.id 
        WHERE a.id = $1
      `, [id]);
    })
    .then(result => {
      const transformedAppointment = transformAppointmentData(result.rows[0]);
      res.json(transformedAppointment);
    })
    .catch(err => {
      console.error('Erreur lors de la mise à jour du rendez-vous:', err);
      res.status(500).json({ message: 'Erreur lors de la mise à jour du rendez-vous' });
    });
});

// Supprimer un rendez-vous
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM appointments WHERE id = $1', [id])
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Rendez-vous non trouvé' });
      }
      res.json({ message: 'Rendez-vous supprimé avec succès' });
    })
    .catch(err => {
      console.error('Erreur lors de la suppression du rendez-vous:', err);
      res.status(500).json({ message: 'Erreur lors de la suppression du rendez-vous' });
    });
});

// Récupérer les rendez-vous par entreprise
router.get('/company/:companyId', authenticateToken, (req, res) => {
  const { companyId } = req.params;
  
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.company_id = c.id 
    LEFT JOIN users u ON a.user_id = u.id 
    WHERE a.company_id = $1
    ORDER BY a.date DESC
  `;
  
  pool.query(query, [companyId])
    .then(result => {
      const transformedAppointments = result.rows.map(transformAppointmentData);
      res.json(transformedAppointments);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des rendez-vous par entreprise:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous par entreprise' });
    });
});

// Récupérer les rendez-vous du jour
router.get('/today', authenticateToken, (req, res) => {
  const query = `
    SELECT a.*, c.name as companyName, u.name as userName 
    FROM appointments a 
    LEFT JOIN companies c ON a.company_id = c.id 
    LEFT JOIN users u ON a.user_id = u.id 
    WHERE DATE(a.date) = CURRENT_DATE
    ORDER BY a.date ASC
  `;
  
  pool.query(query)
    .then(result => {
      const transformedAppointments = result.rows.map(transformAppointmentData);
      res.json(transformedAppointments);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des rendez-vous du jour:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des rendez-vous du jour' });
    });
});

module.exports = router; 