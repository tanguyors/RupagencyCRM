const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Créer le token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Retourner les données utilisateur sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: {
        ...userWithoutPassword,
        badges: user.badges ? JSON.parse(user.badges) : []
      },
      token
    });
  });
});

// Vérifier le token
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    db.get('SELECT * FROM users WHERE id = ?', [decoded.id], (err, user) => {
      if (err || !user) {
        return res.status(401).json({ message: 'Utilisateur non trouvé' });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({
        user: {
          ...userWithoutPassword,
          badges: user.badges ? JSON.parse(user.badges) : []
        }
      });
    });
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
});

// Middleware pour vérifier l'authentification
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalide' });
  }
};

module.exports = { router, authenticateToken }; 