const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'rupagency.db');
const db = new sqlite3.Database(dbPath);

// Initialiser la base de données
const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
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
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Table companies
      db.run(`
        CREATE TABLE IF NOT EXISTS companies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          phone TEXT,
          city TEXT,
          postalCode TEXT,
          country TEXT DEFAULT 'France',
          siren TEXT,
          manager TEXT,
          sector TEXT,
          email TEXT,
          website TEXT,
          size TEXT,
          notes TEXT,
          status TEXT DEFAULT 'Prospect',
          assignedTo INTEGER,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (assignedTo) REFERENCES users (id)
        )
      `);

      // Table calls
      db.run(`
        CREATE TABLE IF NOT EXISTS calls (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          companyId INTEGER NOT NULL,
          type TEXT NOT NULL,
          scheduledDateTime DATETIME NOT NULL,
          notes TEXT,
          priority TEXT DEFAULT 'Normal',
          status TEXT DEFAULT 'Programmé',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          userId INTEGER,
          FOREIGN KEY (companyId) REFERENCES companies (id),
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `);

      // Table appointments
      db.run(`
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          companyId INTEGER NOT NULL,
          date DATETIME NOT NULL,
          briefing TEXT,
          status TEXT DEFAULT 'En attente',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          userId INTEGER,
          FOREIGN KEY (companyId) REFERENCES companies (id),
          FOREIGN KEY (userId) REFERENCES users (id)
        )
      `);

      // Insérer les données initiales si la base est vide
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row.count === 0) {
          insertInitialData();
        }
        resolve();
      });
    });
  });
};

const insertInitialData = () => {
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

  users.forEach(user => {
    db.run(`
      INSERT INTO users (name, email, phone, password, role, avatar, xp, level, badges)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [user.name, user.email, user.phone, user.password, user.role, user.avatar, user.xp, user.level, user.badges]);
  });

  // Insérer quelques entreprises d'exemple
  const companies = [
    {
      name: "TechSolutions SARL",
      phone: "01 42 34 56 78",
      city: "Paris",
      postalCode: "75001",
      siren: "123456789",
      manager: "Jean Dupont",
      sector: "Technologie",
      email: "contact@techsolutions.fr",
      website: "www.techsolutions.fr",
      size: "10-50",
      notes: "Intéressé par nos solutions de prospection",
      assignedTo: 1
    },
    {
      name: "Marketing Pro",
      phone: "04 78 12 34 56",
      city: "Lyon",
      postalCode: "69001",
      siren: "987654321",
      manager: "Marie Laurent",
      sector: "Marketing",
      email: "info@marketingpro.fr",
      website: "www.marketingpro.fr",
      size: "5-10",
      notes: "Besoin de développement commercial",
      assignedTo: 2
    }
  ];

  companies.forEach(company => {
    db.run(`
      INSERT INTO companies (name, phone, city, postalCode, siren, manager, sector, email, website, size, notes, assignedTo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [company.name, company.phone, company.city, company.postalCode, company.siren, company.manager, company.sector, company.email, company.website, company.size, company.notes, company.assignedTo]);
  });
};

module.exports = { db, initDatabase }; 