const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Configuration de la base de données
let pool;
let db;

if (process.env.NODE_ENV === 'production') {
  // PostgreSQL en production
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
} else {
  // SQLite en développement
  db = new sqlite3.Database(path.join(__dirname, 'rupagency.db'));
}

// Initialiser la base de données
const initDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      await initPostgreSQL();
    } else {
      await initSQLite();
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
};

const initPostgreSQL = async () => {
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
      google_rating DECIMAL(2,1),
      google_reviews_count INTEGER,
      status TEXT DEFAULT 'Prospect',
      assigned_to INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users (id)
    )
  `);

  // Migration douce: ajouter les colonnes Google si absentes (bases déjà créées)
  await pool.query(`
    ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1);
  `);
  await pool.query(`
    ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS google_reviews_count INTEGER;
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
    await insertInitialDataPostgreSQL();
  }

  console.log('Base de données PostgreSQL initialisée avec succès');
};

const initSQLite = () => {
  return new Promise((resolve, reject) => {
    // Table users
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table companies
    db.run(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        google_rating REAL,
        google_reviews_count INTEGER,
        status TEXT DEFAULT 'Prospect',
        assigned_to INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES users (id)
      )
    `);

    // Migration douce: ajouter les colonnes si la table existante ne les a pas
    db.all(`PRAGMA table_info(companies)`, (pragmaErr, rows) => {
      if (pragmaErr) {
        reject(pragmaErr);
        return;
      }

      const columns = rows.map(r => r.name);
      const addColumnPromises = [];
      if (!columns.includes('google_rating')) {
        addColumnPromises.push(new Promise((res, rej) => {
          db.run(`ALTER TABLE companies ADD COLUMN google_rating REAL`, (e) => e ? rej(e) : res());
        }));
      }
      if (!columns.includes('google_reviews_count')) {
        addColumnPromises.push(new Promise((res, rej) => {
          db.run(`ALTER TABLE companies ADD COLUMN google_reviews_count INTEGER`, (e) => e ? rej(e) : res());
        }));
      }

      Promise.all(addColumnPromises)
        .then(() => {
          // Table calls
          db.run(`
            CREATE TABLE IF NOT EXISTS calls (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              company_id INTEGER NOT NULL,
              type TEXT NOT NULL,
              scheduled_date_time DATETIME NOT NULL,
              notes TEXT,
              priority TEXT DEFAULT 'Normal',
              status TEXT DEFAULT 'Programmé',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              user_id INTEGER,
              FOREIGN KEY (company_id) REFERENCES companies (id),
              FOREIGN KEY (user_id) REFERENCES users (id)
            )
          `);

          // Table appointments
          db.run(`
            CREATE TABLE IF NOT EXISTS appointments (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              company_id INTEGER NOT NULL,
              date DATETIME NOT NULL,
              briefing TEXT,
              status TEXT DEFAULT 'En attente',
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              user_id INTEGER,
              FOREIGN KEY (company_id) REFERENCES companies (id),
              FOREIGN KEY (user_id) REFERENCES users (id)
            )
          `, (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Vérifier si des données existent déjà
            db.get("SELECT COUNT(*) as count FROM users", (err2, row) => {
              if (err2) {
                reject(err2);
                return;
              }
              
              if (row.count === 0) {
                insertInitialDataSQLite().then(resolve).catch(reject);
              } else {
                console.log('Base de données SQLite initialisée avec succès');
                resolve();
              }
            });
          });
        })
        .catch(reject);
    });
  });
};

// Insérer les données initiales PostgreSQL
const insertInitialDataPostgreSQL = async () => {
  try {
    // Hasher les mots de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Insérer l'utilisateur admin
    await pool.query(`
      INSERT INTO users (name, email, phone, password, role, status, avatar, xp, level, badges)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      'Admin Rupagency',
      'admin@rupagency.com',
      '06 12 34 56 78',
      hashedPassword,
      'admin',
      'active',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      1500,
      3,
      JSON.stringify(['Top Performer', 'Team Leader'])
    ]);

    console.log('Données initiales PostgreSQL insérées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données initiales PostgreSQL:', error);
    throw error;
  }
};

// Insérer les données initiales SQLite
const insertInitialDataSQLite = () => {
  return new Promise(async (resolve, reject) => {
    try {
      // Hasher les mots de passe
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Insérer l'utilisateur admin
      db.run(`
        INSERT INTO users (name, email, phone, password, role, status, avatar, xp, level, badges)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Admin Rupagency',
        'admin@rupagency.com',
        '06 12 34 56 78',
        hashedPassword,
        'admin',
        'active',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        1500,
        3,
        JSON.stringify(['Top Performer', 'Team Leader'])
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }
        console.log('Données initiales SQLite insérées avec succès');
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Fonction pour exécuter des requêtes
const query = (sql, params = []) => {
  if (process.env.NODE_ENV === 'production') {
    return pool.query(sql, params);
  } else {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    });
  }
};

// Fonction pour exécuter une requête qui retourne une seule ligne
const queryOne = (sql, params = []) => {
  if (process.env.NODE_ENV === 'production') {
    return pool.query(sql, params).then(result => result.rows[0]);
  } else {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }
};

// Fonction pour exécuter une requête d'insertion/mise à jour
const run = (sql, params = []) => {
  if (process.env.NODE_ENV === 'production') {
    return pool.query(sql, params);
  } else {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ rowCount: this.changes, lastID: this.lastID });
        }
      });
    });
  }
};

module.exports = {
  pool: process.env.NODE_ENV === 'production' ? pool : null,
  db: process.env.NODE_ENV === 'production' ? null : db,
  initDatabase,
  query,
  queryOne,
  run
}; 