const express = require('express');
const bcrypt = require('bcryptjs');
const { pool } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Fonction pour transformer les données PostgreSQL en format frontend
const transformUserData = (row) => {
  let badges = [];
  try {
    if (row.badges && typeof row.badges === 'string') {
      badges = JSON.parse(row.badges);
    }
  } catch (error) {
    console.error('Erreur lors du parsing des badges:', error);
    badges = [];
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    status: row.status,
    avatar: row.avatar,
    xp: row.xp,
    level: row.level,
    badges: badges,
    createdAt: row.created_at
  };
};

// Récupérer tous les utilisateurs
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, created_at
    FROM users 
    ORDER BY created_at DESC
  `;
  
  pool.query(query)
    .then(result => {
      const transformedUsers = result.rows.map(transformUserData);
      res.json(transformedUsers);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des utilisateurs:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    });
});

// Récupérer un utilisateur par ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, created_at
    FROM users 
    WHERE id = $1
  `;
  
  pool.query(query, [id])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      const transformedUser = transformUserData(result.rows[0]);
      res.json(transformedUser);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération de l\'utilisateur:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    });
});

// Créer un nouvel utilisateur
router.post('/', authenticateToken, (req, res) => {
  const {
    name,
    email,
    phone,
    password,
    role,
    status,
    avatar,
    xp,
    level,
    badges
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nom, email et mot de passe sont obligatoires' });
  }

  // Hasher le mot de passe
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = `
    INSERT INTO users (name, email, phone, password, role, status, avatar, xp, level, badges)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    name, email, phone, hashedPassword, role || 'closer', status || 'active',
    avatar, xp || 0, level || 1, badges ? JSON.stringify(badges) : '[]'
  ];

  pool.query(query, values)
    .then(result => {
      const transformedUser = transformUserData(result.rows[0]);
      res.status(201).json(transformedUser);
    })
    .catch(err => {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      if (err.code === '23505') { // Code PostgreSQL pour contrainte unique
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    });
});

// Mettre à jour un utilisateur
router.put('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const {
    name,
    email,
    phone,
    password,
    role,
    status,
    avatar,
    xp,
    level,
    badges
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nom et email sont obligatoires' });
  }

  let query, values;

  if (password) {
    // Si un nouveau mot de passe est fourni, le hasher
    const hashedPassword = bcrypt.hashSync(password, 10);
    query = `
      UPDATE users SET 
        name = $1, email = $2, phone = $3, password = $4, role = $5, 
        status = $6, avatar = $7, xp = $8, level = $9, badges = $10
      WHERE id = $11
    `;
    values = [
      name, email, phone, hashedPassword, role, status, avatar, xp, level,
      badges ? JSON.stringify(badges) : '[]', id
    ];
  } else {
    // Sinon, ne pas modifier le mot de passe
    query = `
      UPDATE users SET 
        name = $1, email = $2, phone = $3, role = $4, 
        status = $5, avatar = $6, xp = $7, level = $8, badges = $9
      WHERE id = $10
    `;
    values = [
      name, email, phone, role, status, avatar, xp, level,
      badges ? JSON.stringify(badges) : '[]', id
    ];
  }

  pool.query(query, values)
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }

      // Récupérer l'utilisateur mis à jour
      return pool.query(`
        SELECT id, name, email, phone, role, status, avatar, xp, level, badges, created_at
        FROM users 
        WHERE id = $1
      `, [id]);
    })
    .then(result => {
      const transformedUser = transformUserData(result.rows[0]);
      res.json(transformedUser);
    })
    .catch(err => {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', err);
      if (err.code === '23505') { // Code PostgreSQL pour contrainte unique
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    });
});

// Supprimer un utilisateur
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  pool.query('DELETE FROM users WHERE id = $1', [id])
    .then(result => {
      if (result.rowCount === 0) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json({ message: 'Utilisateur supprimé avec succès' });
    })
    .catch(err => {
      console.error('Erreur lors de la suppression de l\'utilisateur:', err);
      res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    });
});

// Récupérer les utilisateurs par rôle
router.get('/role/:role', authenticateToken, (req, res) => {
  const { role } = req.params;
  
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, created_at
    FROM users 
    WHERE role = $1
    ORDER BY created_at DESC
  `;
  
  pool.query(query, [role])
    .then(result => {
      const transformedUsers = result.rows.map(transformUserData);
      res.json(transformedUsers);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des utilisateurs par rôle:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs par rôle' });
    });
});

// Récupérer les utilisateurs actifs
router.get('/status/active', authenticateToken, (req, res) => {
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, created_at
    FROM users 
    WHERE status = 'active'
    ORDER BY created_at DESC
  `;
  
  pool.query(query)
    .then(result => {
      const transformedUsers = result.rows.map(transformUserData);
      res.json(transformedUsers);
    })
    .catch(err => {
      console.error('Erreur lors de la récupération des utilisateurs actifs:', err);
      res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs actifs' });
    });
});

module.exports = router; 