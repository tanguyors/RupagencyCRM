const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://web-production-d52c8.up.railway.app/api'
    : 'http://localhost:5000/api');

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    // Récupérer le token à chaque appel
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    console.log('API: Requête vers:', url);
    console.log('API: Headers:', config.headers);

    try {
      const response = await fetch(url, config);
      
      console.log('API: Statut de la réponse:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Si l'erreur est liée à l'authentification, rediriger vers login
        if (response.status === 401) {
          localStorage.removeItem('token');
          // Rediriger vers la page de login si on est sur une page protégée
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API: Réponse reçue:', result);
      return result;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async verifyToken() {
    return await this.request('/auth/verify');
  }

  logout() {
    this.setToken(null);
  }

  // Companies
  async getCompanies() {
    console.log('API: Appel getCompanies()');
    console.log('API: URL de base:', this.baseURL);
    console.log('API: Token disponible:', !!localStorage.getItem('token'));
    const result = await this.request('/companies');
    console.log('API: Résultat getCompanies:', result);
    return result;
  }

  async getCompany(id) {
    return await this.request(`/companies/${id}`);
  }

  async createCompany(companyData) {
    return await this.request('/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async updateCompany(id, companyData) {
    return await this.request(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData),
    });
  }

  async deleteCompany(id) {
    return await this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  async searchCompanies(term) {
    return await this.request(`/companies/search/${term}`);
  }

  // Calls
  async getCalls() {
    return await this.request('/calls');
  }

  async getCall(id) {
    return await this.request(`/calls/${id}`);
  }

  async createCall(callData) {
    return await this.request('/calls', {
      method: 'POST',
      body: JSON.stringify(callData),
    });
  }

  async updateCall(id, callData) {
    return await this.request(`/calls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(callData),
    });
  }

  async deleteCall(id) {
    return await this.request(`/calls/${id}`, {
      method: 'DELETE',
    });
  }

  async getCallsByCompany(companyId) {
    return await this.request(`/calls/company/${companyId}`);
  }

  // Appointments
  async getAppointments() {
    return await this.request('/appointments');
  }

  async getAppointment(id) {
    return await this.request(`/appointments/${id}`);
  }

  async createAppointment(appointmentData) {
    return await this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id, appointmentData) {
    return await this.request(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appointmentData),
    });
  }

  async deleteAppointment(id) {
    return await this.request(`/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  async getAppointmentsByCompany(companyId) {
    return await this.request(`/appointments/company/${companyId}`);
  }

  async getTodayAppointments() {
    return await this.request('/appointments/today');
  }

  // Users
  async getUsers() {
    return await this.request('/users');
  }

  async getUser(id) {
    return await this.request(`/users/${id}`);
  }

  async createUser(userData) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id, userData) {
    return await this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return await this.request(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsersByRole(role) {
    return await this.request(`/users/role/${role}`);
  }

  async getActiveUsers() {
    return await this.request('/users/active');
  }

  // Stats
  async getStats() {
    return await this.request('/stats');
  }

  async getUserStats(userId) {
    return await this.request(`/stats/user/${userId}`);
  }

  async getMonthlyStats() {
    return await this.request('/stats/monthly');
  }

  async getSectorStats() {
    return await this.request('/stats/sector');
  }

  async getPerformanceStats() {
    return await this.request('/stats/performance');
  }
}

const apiService = new ApiService();

export default apiService; 