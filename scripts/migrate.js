const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
require('dotenv').config();

// Configuration SQLite (source)
const sqliteDb = new sqlite3.Database('./server/rupagency.db');

// Configuration PostgreSQL (destination)
const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function migrateData() {
  console.log('🚀 Début de la migration SQLite → PostgreSQL...');
  
  const client = await pgPool.connect();
  
  try {
    // Migrer les utilisateurs
    console.log('📦 Migration des utilisateurs...');
    const users = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM users', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, name, email, phone, password, role, status, avatar, xp, level, badges, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (id) DO NOTHING
      `, [
        user.id, user.name, user.email, user.phone, user.password, 
        user.role, user.status, user.avatar, user.xp, user.level, 
        user.badges, user.createdAt
      ]);
    }
    
    // Migrer les entreprises
    console.log('🏢 Migration des entreprises...');
    const companies = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM companies', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const company of companies) {
      await client.query(`
        INSERT INTO companies (id, name, phone, city, postal_code, country, siren, manager, sector, email, website, size, notes, status, assigned_to, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (id) DO NOTHING
      `, [
        company.id, company.name, company.phone, company.city, 
        company.postalCode, company.country, company.siren, company.manager,
        company.sector, company.email, company.website, company.size,
        company.notes, company.status, company.assignedTo, company.createdAt
      ]);
    }
    
    // Migrer les appels
    console.log('📞 Migration des appels...');
    const calls = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM calls', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const call of calls) {
      await client.query(`
        INSERT INTO calls (id, company_id, type, scheduled_date_time, notes, priority, status, created_at, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO NOTHING
      `, [
        call.id, call.companyId, call.type, call.scheduledDateTime,
        call.notes, call.priority, call.status, call.createdAt, call.userId
      ]);
    }
    
    // Migrer les rendez-vous
    console.log('📅 Migration des rendez-vous...');
    const appointments = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM appointments', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    for (const appointment of appointments) {
      await client.query(`
        INSERT INTO appointments (id, company_id, date, briefing, status, created_at, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [
        appointment.id, appointment.companyId, appointment.date,
        appointment.briefing, appointment.status, appointment.createdAt, appointment.userId
      ]);
    }
    
    console.log('✅ Migration terminée avec succès !');
    console.log(`📊 Données migrées :`);
    console.log(`   - ${users.length} utilisateurs`);
    console.log(`   - ${companies.length} entreprises`);
    console.log(`   - ${calls.length} appels`);
    console.log(`   - ${appointments.length} rendez-vous`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  } finally {
    client.release();
    sqliteDb.close();
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('🎉 Migration réussie !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Échec de la migration:', error);
      process.exit(1);
    });
}

module.exports = { migrateData }; 