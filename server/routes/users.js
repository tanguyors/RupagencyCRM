const express = require('express');
const bcrypt = require('bcryptjs');
const { db } = require('../database');
const { authenticateToken } = require('./auth');

const router = express.Router();

// Récupérer tous les utilisateurs
router.get('/', authenticateToken, (req, res) => {
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, createdAt
    FROM users 
    ORDER BY createdAt DESC
  `;
  
  db.all(query, (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    
    // Parser les badges JSON
    const usersWithParsedBadges = users.map(user => ({
      ...user,
      badges: user.badges ? JSON.parse(user.badges) : []
    }));
    
    res.json(usersWithParsedBadges);
  });
});

// Récupérer un utilisateur par ID
router.get('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, createdAt
    FROM users 
    WHERE id = ?
  `;
  
  db.get(query, [id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur' });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json({
      ...user,
      badges: user.badges ? JSON.parse(user.badges) : []
    });
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    name, email, phone, hashedPassword, role || 'closer', status || 'active',
    avatar, xp || 0, level || 1, badges ? JSON.stringify(badges) : '[]'
  ];

  db.run(query, values, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      return res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur' });
    }

    // Récupérer l'utilisateur créé
    db.get(`
      SELECT id, name, email, phone, role, status, avatar, xp, level, badges, createdAt
      FROM users 
      WHERE id = ?
    `, [this.lastID], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur créé' });
      }
      res.status(201).json({
        ...user,
        badges: user.badges ? JSON.parse(user.badges) : []
      });
    });
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
        name = ?, email = ?, phone = ?, password = ?, role = ?, status = ?, 
        avatar = ?, xp = ?, level = ?, badges = ?
      WHERE id = ?
    `;
    values = [
      name, email, phone, hashedPassword, role, status, avatar, xp, level,
      badges ? JSON.stringify(badges) : '[]', id
    ];
  } else {
    // Sinon, ne pas modifier le mot de passe
    query = `
      UPDATE users SET 
        name = ?, email = ?, phone = ?, role = ?, status = ?, 
        avatar = ?, xp = ?, level = ?, badges = ?
      WHERE id = ?
    `;
    values = [
      name, email, phone, role, status, avatar, xp, level,
      badges ? JSON.stringify(badges) : '[]', id
    ];
  }

  db.run(query, values, function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Récupérer l'utilisateur mis à jour
    db.get(`
      SELECT id, name, email, phone, role, status, avatar, xp, level, badges, createdAt
      FROM users 
      WHERE id = ?
    `, [id], (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur mis à jour' });
      }
      res.json({
        ...user,
        badges: user.badges ? JSON.parse(user.badges) : []
      });
    });
  });
});

// Supprimer un utilisateur
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });
  });
});

// Récupérer les utilisateurs par rôle
router.get('/role/:role', authenticateToken, (req, res) => {
  const { role } = req.params;
  
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, createdAt
    FROM users 
    WHERE role = ?
    ORDER BY createdAt DESC
  `;
  
  db.all(query, [role], (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
    
    const usersWithParsedBadges = users.map(user => ({
      ...user,
      badges: user.badges ? JSON.parse(user.badges) : []
    }));
    
    res.json(usersWithParsedBadges);
  });
});

// Récupérer les utilisateurs actifs
router.get('/status/active', authenticateToken, (req, res) => {
  const query = `
    SELECT id, name, email, phone, role, status, avatar, xp, level, badges, createdAt
    FROM users 
    WHERE status = 'active'
    ORDER BY createdAt DESC
  `;
  
  db.all(query, (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs actifs' });
    }
    
    const usersWithParsedBadges = users.map(user => ({
      ...user,
      badges: user.badges ? JSON.parse(user.badges) : []
    }));
    
    res.json(usersWithParsedBadges);
  });
});

module.exports = router; 