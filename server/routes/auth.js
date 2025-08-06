const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  pool.query('SELECT * FROM users WHERE email = $1', [email])
    .then(result => {
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
      }

      const user = result.rows[0];
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
      
      // Parser les badges de manière sécurisée
      let badges = [];
      try {
        if (user.badges && typeof user.badges === 'string') {
          badges = JSON.parse(user.badges);
        }
      } catch (error) {
        console.error('Erreur lors du parsing des badges:', error);
        badges = [];
      }
      
      res.json({
        user: {
          ...userWithoutPassword,
          badges: badges
        },
        token
      });
    })
    .catch(err => {
      console.error('Erreur lors de la connexion:', err);
      res.status(500).json({ message: 'Erreur serveur' });
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
    
    pool.query('SELECT * FROM users WHERE id = $1', [decoded.id])
      .then(result => {
        if (result.rows.length === 0) {
          return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        const user = result.rows[0];
        const { password: _, ...userWithoutPassword } = user;
        
        // Parser les badges de manière sécurisée
        let badges = [];
        try {
          if (user.badges && typeof user.badges === 'string') {
            badges = JSON.parse(user.badges);
          }
        } catch (error) {
          console.error('Erreur lors du parsing des badges:', error);
          badges = [];
        }
        
        res.json({
          user: {
            ...userWithoutPassword,
            badges: badges
          }
        });
      })
      .catch(err => {
        console.error('Erreur lors de la vérification du token:', err);
        res.status(500).json({ message: 'Erreur serveur' });
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