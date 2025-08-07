const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('Test de l\'API...');
  
  try {
    // Test de connexion
    console.log('1. Test de connexion...');
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@rupagency.com',
        password: 'admin123'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur de connexion: ${response.status}`);
    }
    
    const authData = await response.json();
    console.log('Connexion réussie, token:', authData.token ? 'présent' : 'absent');
    
    // Test de récupération des entreprises
    console.log('2. Test de récupération des entreprises...');
    const companiesResponse = await fetch(`${API_BASE_URL}/companies`, {
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!companiesResponse.ok) {
      throw new Error(`Erreur de récupération des entreprises: ${companiesResponse.status}`);
    }
    
    const companies = await companiesResponse.json();
    console.log(`Entreprises récupérées: ${companies.length} entreprises`);
    companies.forEach(company => {
      console.log(`- ${company.name} (ID: ${company.id})`);
    });
    
  } catch (error) {
    console.error('Erreur lors du test:', error.message);
  }
}

testAPI();
