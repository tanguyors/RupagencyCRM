const express = require('express');
const { pool } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Récupérer les statistiques globales
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Compter le nombre total d'appels
    const callsResult = await pool.query('SELECT COUNT(*) as totalCalls FROM calls');
    const totalCalls = parseInt(callsResult.rows[0].totalcalls);

    // Compter le nombre total de rendez-vous
    const appointmentsResult = await pool.query('SELECT COUNT(*) as totalAppointments FROM appointments');
    const totalAppointments = parseInt(appointmentsResult.rows[0].totalappointments);

    // Compter le nombre total d'entreprises
    const companiesResult = await pool.query('SELECT COUNT(*) as totalCompanies FROM companies');
    const totalCompanies = parseInt(companiesResult.rows[0].totalcompanies);

    // Calculer le taux de conversion
    const conversionRate = totalCalls > 0 ? ((totalAppointments / totalCalls) * 100).toFixed(1) : 0;

    // Calculer le chiffre d'affaires total (simulation)
    const totalRevenue = totalAppointments * 2000; // 2000€ par rendez-vous en moyenne

    // Récupérer les meilleurs performeurs
    const topPerformersResult = await pool.query(`
      SELECT u.name, COUNT(a.id) as appointments, COUNT(a.id) * 2000 as revenue
      FROM users u
      LEFT JOIN appointments a ON u.id = a.user_id
      WHERE u.role = 'closer'
      GROUP BY u.id, u.name
      ORDER BY appointments DESC
      LIMIT 5
    `);

    res.json({
      totalCalls,
      totalAppointments,
      totalCompanies,
      conversionRate: parseFloat(conversionRate),
      totalRevenue,
      topPerformers: topPerformersResult.rows
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
  }
});

// Récupérer les statistiques par utilisateur
router.get('/user/:userId', authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // Statistiques des appels
    const callsResult = await pool.query('SELECT COUNT(*) as totalCalls FROM calls WHERE user_id = $1', [userId]);
    const totalCalls = parseInt(callsResult.rows[0].totalcalls);

    // Statistiques des rendez-vous
    const appointmentsResult = await pool.query('SELECT COUNT(*) as totalAppointments FROM appointments WHERE user_id = $1', [userId]);
    const totalAppointments = parseInt(appointmentsResult.rows[0].totalappointments);

    // Statistiques des entreprises assignées
    const companiesResult = await pool.query('SELECT COUNT(*) as totalCompanies FROM companies WHERE assigned_to = $1', [userId]);
    const totalCompanies = parseInt(companiesResult.rows[0].totalcompanies);

    const conversionRate = totalCalls > 0 ? ((totalAppointments / totalCalls) * 100).toFixed(1) : 0;
    const totalRevenue = totalAppointments * 2000;

    res.json({
      totalCalls,
      totalAppointments,
      totalCompanies,
      conversionRate: parseFloat(conversionRate),
      totalRevenue
    });
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques utilisateur:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques utilisateur' });
  }
});

// Récupérer les statistiques mensuelles
router.get('/monthly', authenticateToken, async (req, res) => {
  try {
    const monthlyStats = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as totalCalls,
        COUNT(CASE WHEN status = 'Terminé' THEN 1 END) as completedCalls
      FROM calls 
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    res.json(monthlyStats.rows);
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques mensuelles:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques mensuelles' });
  }
});

// Récupérer les statistiques par secteur
router.get('/sector', authenticateToken, async (req, res) => {
  try {
    const sectorStats = await pool.query(`
      SELECT 
        sector,
        COUNT(*) as totalCompanies,
        COUNT(CASE WHEN status = 'Client' THEN 1 END) as clients,
        COUNT(CASE WHEN status = 'Prospect' THEN 1 END) as prospects
      FROM companies 
      WHERE sector IS NOT NULL
      GROUP BY sector
      ORDER BY totalCompanies DESC
    `);

    res.json(sectorStats.rows);
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques par secteur:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques par secteur' });
  }
});

// Récupérer les statistiques de performance
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const performanceStats = await pool.query(`
      SELECT 
        u.name,
        u.role,
        COUNT(DISTINCT c.id) as totalCalls,
        COUNT(DISTINCT a.id) as totalAppointments,
        COUNT(DISTINCT co.id) as totalCompanies,
        CASE 
          WHEN COUNT(DISTINCT c.id) > 0 
          THEN ROUND((COUNT(DISTINCT a.id)::float / COUNT(DISTINCT c.id)::float * 100), 1)
          ELSE 0 
        END as conversionRate,
        COUNT(DISTINCT a.id) * 2000 as revenue
      FROM users u
      LEFT JOIN calls c ON u.id = c.user_id
      LEFT JOIN appointments a ON u.id = a.user_id
      LEFT JOIN companies co ON u.id = co.assigned_to
      WHERE u.role = 'closer'
      GROUP BY u.id, u.name, u.role
      ORDER BY conversionRate DESC
    `);

    res.json(performanceStats.rows);
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques de performance:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques de performance' });
  }
});

module.exports = router; 