const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Configuration de la base de données PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialiser la base de données
const initDatabase = async () => {
  try {
    // Table users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'closer',
        status TEXT DEFAULT 'active',
        avatar TEXT,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        badges TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table companies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'France',
        siren TEXT,
        manager TEXT,
        sector TEXT,
        email TEXT,
        website TEXT,
        size TEXT,
        notes TEXT,
        status TEXT DEFAULT 'Prospect',
        assigned_to INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users (id)
      )
    `);

    // Table calls
    await pool.query(`
      CREATE TABLE IF NOT EXISTS calls (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        scheduled_date_time TIMESTAMP NOT NULL,
        notes TEXT,
        priority TEXT DEFAULT 'Normal',
        status TEXT DEFAULT 'Programmé',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY (company_id) REFERENCES companies (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Table appointments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        company_id INTEGER NOT NULL,
        date TIMESTAMP NOT NULL,
        briefing TEXT,
        status TEXT DEFAULT 'En attente',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER,
        FOREIGN KEY (company_id) REFERENCES companies (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Vérifier si des données existent déjà
    const result = await pool.query("SELECT COUNT(*) as count FROM users");
    if (result.rows[0].count === '0') {
      await insertInitialData();
    }

    console.log('Base de données PostgreSQL initialisée avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

// Insérer les données initiales
const insertInitialData = async () => {
  try {
    // Hasher les mots de passe
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insérer les utilisateurs
    const users = [
      {
        name: 'Thomas Martin',
        email: 'thomas@rupagency.com',
        phone: '06 12 34 56 78',
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        xp: 1500,
        level: 3,
        badges: JSON.stringify(['Top Performer', 'Team Leader'])
      },
      {
        name: 'Sarah Dubois',
        email: 'sarah@rupagency.com',
        phone: '06 98 76 54 32',
        password: hashedPassword,
        role: 'closer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        xp: 800,
        level: 2,
        badges: JSON.stringify(['Rising Star'])
      },
      {
        name: 'Marc Leroy',
        email: 'marc@rupagency.com',
        phone: '06 11 22 33 44',
        password: hashedPassword,
        role: 'closer',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        xp: 1200,
        level: 2,
        badges: JSON.stringify(['Consistent'])
      }
    ];

    for (const user of users) {
      await pool.query(`
        INSERT INTO users (name, email, phone, password, role, status, avatar, xp, level, badges)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [user.name, user.email, user.phone, user.password, user.role, user.status, user.avatar, user.xp, user.level, user.badges]);
    }

    // Insérer les entreprises
    const companies = [
      {
        name: 'TechSolutions SARL',
        phone: '01 42 34 56 78',
        city: 'Paris',
        postal_code: '75001',
        country: 'France',
        siren: '123456789',
        manager: 'Jean Dupont',
        sector: 'Technologie',
        email: 'contact@techsolutions.fr',
        website: 'https://techsolutions.fr',
        size: '10-50',
        notes: 'Entreprise spécialisée dans le développement web',
        status: 'Prospect',
        assigned_to: 1
      },
      {
        name: 'Marketing Pro',
        phone: '04 78 90 12 34',
        city: 'Lyon',
        postal_code: '69001',
        country: 'France',
        siren: '987654321',
        manager: 'Marie Martin',
        sector: 'Marketing',
        email: 'info@marketingpro.fr',
        website: 'https://marketingpro.fr',
        size: '5-10',
        notes: 'Agence de marketing digital',
        status: 'Client',
        assigned_to: 2
      },
      {
        name: 'Consulting Plus',
        phone: '05 61 23 45 67',
        city: 'Toulouse',
        postal_code: '31000',
        country: 'France',
        siren: '456789123',
        manager: 'Pierre Durand',
        sector: 'Conseil',
        email: 'contact@consultingplus.fr',
        website: 'https://consultingplus.fr',
        size: '50-100',
        notes: 'Cabinet de conseil en stratégie',
        status: 'Prospect',
        assigned_to: 3
      }
    ];

    for (const company of companies) {
      await pool.query(`
        INSERT INTO companies (name, phone, city, postal_code, country, siren, manager, sector, email, website, size, notes, status, assigned_to)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [company.name, company.phone, company.city, company.postal_code, company.country, company.siren, company.manager, company.sector, company.email, company.website, company.size, company.notes, company.status, company.assigned_to]);
    }

    // Insérer les appels
    const calls = [
      {
        company_id: 1,
        type: 'Froid',
        scheduled_date_time: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        notes: 'Premier contact pour présenter nos services',
        priority: 'Haute',
        status: 'Programmé',
        user_id: 1
      },
      {
        company_id: 2,
        type: 'Suivi',
        scheduled_date_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Dans 2 jours
        notes: 'Rappel pour finaliser le contrat',
        priority: 'Normale',
        status: 'Programmé',
        user_id: 2
      }
    ];

    for (const call of calls) {
      await pool.query(`
        INSERT INTO calls (company_id, type, scheduled_date_time, notes, priority, status, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [call.company_id, call.type, call.scheduled_date_time, call.notes, call.priority, call.status, call.user_id]);
    }

    // Insérer les rendez-vous
    const appointments = [
      {
        company_id: 1,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
        briefing: 'Présentation complète de nos solutions',
        status: 'Confirmé',
        user_id: 1
      },
      {
        company_id: 3,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Dans 5 jours
        briefing: 'Débriefing du projet pilote',
        status: 'En attente',
        user_id: 3
      }
    ];

    for (const appointment of appointments) {
      await pool.query(`
        INSERT INTO appointments (company_id, date, briefing, status, user_id)
        VALUES ($1, $2, $3, $4, $5)
      `, [appointment.company_id, appointment.date, appointment.briefing, appointment.status, appointment.user_id]);
    }

    console.log('Données initiales insérées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données initiales:', error);
    throw error;
  }
};

module.exports = {
  pool,
  initDatabase,
  insertInitialData
}; 