const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialiser la base de données
const initDatabase = async () => {
  const client = await pool.connect();
  
  try {
    // Table users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'closer',
        status VARCHAR(50) DEFAULT 'active',
        avatar VARCHAR(10),
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        badges JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table companies
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        city VARCHAR(100),
        postal_code VARCHAR(10),
        country VARCHAR(100) DEFAULT 'France',
        siren VARCHAR(20),
        manager VARCHAR(255),
        sector VARCHAR(100),
        email VARCHAR(255),
        website VARCHAR(255),
        size VARCHAR(50),
        notes TEXT,
        google_rating DECIMAL(2,1),
        google_reviews_count INTEGER,
        status VARCHAR(50) DEFAULT 'Prospect',
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table calls
    await client.query(`
      CREATE TABLE IF NOT EXISTS calls (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id),
        type VARCHAR(100) NOT NULL,
        scheduled_date_time TIMESTAMP NOT NULL,
        notes TEXT,
        priority VARCHAR(50) DEFAULT 'Normal',
        status VARCHAR(50) DEFAULT 'Programmé',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id)
      )
    `);

    // Table appointments
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL REFERENCES companies(id),
        date TIMESTAMP NOT NULL,
        briefing TEXT,
        status VARCHAR(50) DEFAULT 'En attente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id)
      )
    `);

    // Vérifier si des données existent déjà
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCount.rows[0].count) === 0) {
      await insertInitialData(client);
    }

    console.log('✅ Base de données PostgreSQL initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  } finally {
    client.release();
  }
};

const insertInitialData = async (client) => {
  const bcrypt = require('bcryptjs');
  const hashedPassword = bcrypt.hashSync('password123', 10);
  
  // Insérer les utilisateurs initiaux
  const users = [
    {
      name: "Thomas Martin",
      email: "thomas@rupagency.com",
      phone: "+33 6 12 34 56 78",
      password: hashedPassword,
      role: "closer",
      avatar: "TM",
      xp: 1250,
      level: 8,
      badges: JSON.stringify(["Top Performer", "Early Bird"])
    },
    {
      name: "Sophie Dubois",
      email: "sophie@rupagency.com",
      phone: "+33 6 98 76 54 32",
      password: hashedPassword,
      role: "closer",
      avatar: "SD",
      xp: 890,
      level: 6,
      badges: JSON.stringify(["Consistent", "Team Player"])
    },
    {
      name: "Admin Rupagency",
      email: "admin@rupagency.com",
      phone: "+33 6 11 22 33 44",
      password: hashedPassword,
      role: "admin",
      avatar: "AR",
      xp: 2500,
      level: 15,
      badges: JSON.stringify(["Manager", "Founder"])
    }
  ];

  for (const user of users) {
    await client.query(`
      INSERT INTO users (name, email, phone, password, role, avatar, xp, level, badges)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [user.name, user.email, user.phone, user.password, user.role, user.avatar, user.xp, user.level, user.badges]);
  }

  // Insérer quelques entreprises d'exemple
  const companies = [
    {
      name: "TechSolutions SARL",
      phone: "01 42 34 56 78",
      city: "Paris",
      postal_code: "75001",
      siren: "123456789",
      manager: "Jean Dupont",
      sector: "Technologie",
      email: "contact@techsolutions.fr",
      website: "www.techsolutions.fr",
      size: "10-50",
      notes: "Intéressé par nos solutions de prospection",
      assigned_to: 1
    },
    {
      name: "Marketing Pro",
      phone: "04 78 12 34 56",
      city: "Lyon",
      postal_code: "69001",
      siren: "987654321",
      manager: "Marie Laurent",
      sector: "Marketing",
      email: "info@marketingpro.fr",
      website: "www.marketingpro.fr",
      size: "5-10",
      notes: "Besoin de développement commercial",
      assigned_to: 2
    }
  ];

  for (const company of companies) {
    await client.query(`
      INSERT INTO companies (name, phone, city, postal_code, siren, manager, sector, email, website, size, notes, assigned_to)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [company.name, company.phone, company.city, company.postal_code, company.siren, company.manager, company.sector, company.email, company.website, company.size, company.notes, company.assigned_to]);
  }

  console.log('✅ Données initiales insérées avec succès');
};

// Wrapper pour les requêtes
const query = (text, params) => pool.query(text, params);

module.exports = { pool, query, initDatabase }; 