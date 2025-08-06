const express = require('express');
const { db } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Récupérer les statistiques globales
router.get('/', authenticateToken, (req, res) => {
  // Compter le nombre total d'appels
  db.get('SELECT COUNT(*) as totalCalls FROM calls', (err, callsResult) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
    }

    // Compter le nombre total de rendez-vous
    db.get('SELECT COUNT(*) as totalAppointments FROM appointments', (err, appointmentsResult) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
      }

      // Compter le nombre total d'entreprises
      db.get('SELECT COUNT(*) as totalCompanies FROM companies', (err, companiesResult) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
        }

        // Calculer le taux de conversion
        const totalCalls = callsResult.totalCalls;
        const totalAppointments = appointmentsResult.totalAppointments;
        const conversionRate = totalCalls > 0 ? ((totalAppointments / totalCalls) * 100).toFixed(1) : 0;

        // Calculer le chiffre d'affaires total (simulation)
        const totalRevenue = totalAppointments * 2000; // 2000€ par rendez-vous en moyenne

        // Récupérer les meilleurs performeurs
        db.all(`
          SELECT u.name, COUNT(a.id) as appointments, COUNT(a.id) * 2000 as revenue
          FROM users u
          LEFT JOIN appointments a ON u.id = a.userId
          WHERE u.role = 'closer'
          GROUP BY u.id, u.name
          ORDER BY appointments DESC
          LIMIT 5
        `, (err, topPerformers) => {
          if (err) {
            return res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
          }

          res.json({
            totalCalls,
            totalAppointments,
            totalCompanies: companiesResult.totalCompanies,
            conversionRate: parseFloat(conversionRate),
            totalRevenue,
            topPerformers
          });
        });
      });
    });
  });
});

// Récupérer les statistiques par utilisateur
router.get('/user/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;

  // Statistiques des appels
  db.get('SELECT COUNT(*) as totalCalls FROM calls WHERE userId = ?', [userId], (err, callsResult) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du calcul des statistiques utilisateur' });
    }

    // Statistiques des rendez-vous
    db.get('SELECT COUNT(*) as totalAppointments FROM appointments WHERE userId = ?', [userId], (err, appointmentsResult) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors du calcul des statistiques utilisateur' });
      }

      // Statistiques des entreprises assignées
      db.get('SELECT COUNT(*) as totalCompanies FROM companies WHERE assignedTo = ?', [userId], (err, companiesResult) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors du calcul des statistiques utilisateur' });
        }

        const totalCalls = callsResult.totalCalls;
        const totalAppointments = appointmentsResult.totalAppointments;
        const conversionRate = totalCalls > 0 ? ((totalAppointments / totalCalls) * 100).toFixed(1) : 0;
        const totalRevenue = totalAppointments * 2000;

        res.json({
          totalCalls,
          totalAppointments,
          totalCompanies: companiesResult.totalCompanies,
          conversionRate: parseFloat(conversionRate),
          totalRevenue
        });
      });
    });
  });
});

// Récupérer les statistiques mensuelles
router.get('/monthly', authenticateToken, (req, res) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Appels du mois
  db.get(`
    SELECT COUNT(*) as calls 
    FROM calls 
    WHERE strftime('%m', scheduledDateTime) = ? AND strftime('%Y', scheduledDateTime) = ?
  `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, callsResult) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du calcul des statistiques mensuelles' });
    }

    // Rendez-vous du mois
    db.get(`
      SELECT COUNT(*) as appointments 
      FROM appointments 
      WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
    `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, appointmentsResult) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors du calcul des statistiques mensuelles' });
      }

      // Entreprises créées ce mois
      db.get(`
        SELECT COUNT(*) as companies 
        FROM companies 
        WHERE strftime('%m', createdAt) = ? AND strftime('%Y', createdAt) = ?
      `, [currentMonth.toString().padStart(2, '0'), currentYear.toString()], (err, companiesResult) => {
        if (err) {
          return res.status(500).json({ message: 'Erreur lors du calcul des statistiques mensuelles' });
        }

        const monthlyCalls = callsResult.calls;
        const monthlyAppointments = appointmentsResult.appointments;
        const monthlyConversionRate = monthlyCalls > 0 ? ((monthlyAppointments / monthlyCalls) * 100).toFixed(1) : 0;
        const monthlyRevenue = monthlyAppointments * 2000;

        res.json({
          month: currentMonth,
          year: currentYear,
          calls: monthlyCalls,
          appointments: monthlyAppointments,
          companies: companiesResult.companies,
          conversionRate: parseFloat(monthlyConversionRate),
          revenue: monthlyRevenue
        });
      });
    });
  });
});

// Récupérer les statistiques par secteur d'activité
router.get('/sectors', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      c.sector,
      COUNT(c.id) as companies,
      COUNT(DISTINCT cl.id) as calls,
      COUNT(DISTINCT a.id) as appointments
    FROM companies c
    LEFT JOIN calls cl ON c.id = cl.companyId
    LEFT JOIN appointments a ON c.id = a.companyId
    WHERE c.sector IS NOT NULL AND c.sector != ''
    GROUP BY c.sector
    ORDER BY companies DESC
  `, (err, sectors) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du calcul des statistiques par secteur' });
    }

    const sectorsWithConversion = sectors.map(sector => ({
      ...sector,
      conversionRate: sector.calls > 0 ? ((sector.appointments / sector.calls) * 100).toFixed(1) : 0
    }));

    res.json(sectorsWithConversion);
  });
});

// Récupérer les statistiques de performance des utilisateurs
router.get('/performance', authenticateToken, (req, res) => {
  db.all(`
    SELECT 
      u.id,
      u.name,
      u.role,
      COUNT(DISTINCT c.id) as companies,
      COUNT(DISTINCT cl.id) as calls,
      COUNT(DISTINCT a.id) as appointments,
      u.xp,
      u.level
    FROM users u
    LEFT JOIN companies c ON u.id = c.assignedTo
    LEFT JOIN calls cl ON u.id = cl.userId
    LEFT JOIN appointments a ON u.id = a.userId
    WHERE u.role = 'closer'
    GROUP BY u.id, u.name, u.role, u.xp, u.level
    ORDER BY appointments DESC
  `, (err, performance) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors du calcul des performances' });
    }

    const performanceWithConversion = performance.map(user => ({
      ...user,
      conversionRate: user.calls > 0 ? ((user.appointments / user.calls) * 100).toFixed(1) : 0,
      revenue: user.appointments * 2000
    }));

    res.json(performanceWithConversion);
  });
});

module.exports = router; 