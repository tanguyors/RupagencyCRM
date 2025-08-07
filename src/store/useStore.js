import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      
      // Theme
      isDarkMode: false,
      
      // Language is now handled by LanguageContext
      
      // Data (NE PAS PERSISTER - chargé depuis l'API)
      companies: [],
      calls: [],
      appointments: [],
      users: [],
      stats: {
        totalCalls: 0,
        totalAppointments: 0,
        conversionRate: 0,
        totalRevenue: 0,
      },
      
      // Featured content
      featuredContent: "Bienvenue sur votre CRM Rupagency ! Prêt à optimiser vos performances ?",
      
      // Actions
      login: async (email, password) => {
        try {
          const response = await api.login(email, password);
          set({
            user: response.user,
            isAuthenticated: true,
            isAdmin: response.user.role === 'admin',
          });
          return response;
        } catch (error) {
          throw error;
        }
      },
      
      logout: () => {
        api.logout();
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          // Vider les données lors de la déconnexion
          companies: [],
          calls: [],
          appointments: [],
          users: [],
          stats: {
            totalCalls: 0,
            totalAppointments: 0,
            conversionRate: 0,
            totalRevenue: 0,
          },
        });
      },

      // Vérifier l'authentification au démarrage
      checkAuth: async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            set({
              user: null,
              isAuthenticated: false,
              isAdmin: false,
            });
            return false;
          }

          const response = await api.verifyToken();
          set({
            user: response.user,
            isAuthenticated: true,
            isAdmin: response.user.role === 'admin',
          });
          return true;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
          });
          return false;
        }
      },
      
      toggleTheme: () => set((state) => ({
        isDarkMode: !state.isDarkMode,
      })),
      
      // Language management moved to LanguageContext
      
      // Companies
      addCompany: async (company) => {
        try {
          const newCompany = await api.createCompany(company);
          set((state) => ({
            companies: [newCompany, ...state.companies],
          }));
          return newCompany;
        } catch (error) {
          throw error;
        }
      },
      
      updateCompany: async (id, updates) => {
        try {
          const updatedCompany = await api.updateCompany(id, updates);
          set((state) => ({
            companies: state.companies.map(company => 
              company.id === id ? updatedCompany : company
            ),
          }));
          return updatedCompany;
        } catch (error) {
          throw error;
        }
      },
      
      deleteCompany: async (id) => {
        try {
          await api.deleteCompany(id);
          set((state) => ({
            companies: state.companies.filter(company => company.id !== id),
          }));
        } catch (error) {
          throw error;
        }
      },

      fetchCompanies: async () => {
        try {
          const companies = await api.getCompanies();
          set({ companies });
        } catch (error) {
          throw error;
        }
      },

      // Calls
      addCall: async (call) => {
        try {
          const newCall = await api.createCall(call);
          set((state) => ({
            calls: [newCall, ...state.calls],
          }));
          return newCall;
        } catch (error) {
          throw error;
        }
      },
      
      updateCall: async (id, updates) => {
        try {
          const updatedCall = await api.updateCall(id, updates);
          set((state) => ({
            calls: state.calls.map(call => 
              call.id === id ? updatedCall : call
            ),
          }));
          return updatedCall;
        } catch (error) {
          throw error;
        }
      },
      
      deleteCall: async (id) => {
        try {
          await api.deleteCall(id);
          set((state) => ({
            calls: state.calls.filter(call => call.id !== id),
          }));
        } catch (error) {
          throw error;
        }
      },

      fetchCalls: async () => {
        try {
          const calls = await api.getCalls();
          set({ calls });
        } catch (error) {
          throw error;
        }
      },
      
      // Appointments
      addAppointment: async (appointment) => {
        try {
          const newAppointment = await api.createAppointment(appointment);
          set((state) => ({
            appointments: [newAppointment, ...state.appointments],
          }));
          return newAppointment;
        } catch (error) {
          throw error;
        }
      },
      
      updateAppointment: async (id, updates) => {
        try {
          const updatedAppointment = await api.updateAppointment(id, updates);
          set((state) => ({
            appointments: state.appointments.map(appointment => 
              appointment.id === id ? updatedAppointment : appointment
            ),
          }));
          return updatedAppointment;
        } catch (error) {
          throw error;
        }
      },
      
      deleteAppointment: async (id) => {
        try {
          await api.deleteAppointment(id);
          set((state) => ({
            appointments: state.appointments.filter(appointment => appointment.id !== id),
          }));
        } catch (error) {
          throw error;
        }
      },

      fetchAppointments: async () => {
        try {
          const appointments = await api.getAppointments();
          set({ appointments });
        } catch (error) {
          throw error;
        }
      },
      
      // Users
      addUser: async (user) => {
        try {
          const newUser = await api.createUser(user);
          set((state) => ({
            users: [newUser, ...state.users],
          }));
          return newUser;
        } catch (error) {
          throw error;
        }
      },
      
      updateUser: async (id, updates) => {
        try {
          const updatedUser = await api.updateUser(id, updates);
          set((state) => ({
            users: state.users.map(user => 
              user.id === id ? updatedUser : user
            ),
          }));
          return updatedUser;
        } catch (error) {
          throw error;
        }
      },
      
      deleteUser: async (id) => {
        try {
          await api.deleteUser(id);
          set((state) => ({
            users: state.users.filter(user => user.id !== id),
          }));
        } catch (error) {
          throw error;
        }
      },

      fetchUsers: async () => {
        try {
          const users = await api.getUsers();
          set({ users });
        } catch (error) {
          throw error;
        }
      },
      
      // Stats
      updateStats: (newStats) => set({
        stats: { ...get().stats, ...newStats },
      }),

      fetchStats: async () => {
        try {
          const stats = await api.getStats();
          set({ stats });
        } catch (error) {
          throw error;
        }
      },

      // Initialize all data
      initializeData: async () => {
        try {
          await Promise.all([
            get().fetchCompanies(),
            get().fetchCalls(),
            get().fetchAppointments(),
            get().fetchUsers(),
            get().fetchStats()
          ]);
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      },
      
      // Featured content
      updateFeaturedContent: (content) => set({
        featuredContent: content,
      }),
      
      // Getters
      getCompanyById: (id) => get().companies.find(company => company.id === id),
      getCallsByCompanyId: (companyId) => get().calls.filter(call => call.companyId === companyId),
      getAppointmentsByCompanyId: (companyId) => get().appointments.filter(appointment => appointment.companyId === companyId),
      getTodayAppointments: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().appointments.filter(appointment => 
          appointment.date.startsWith(today)
        );
      },
      getRecentCompanies: () => {
        const companies = get().companies;
        return companies
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);
      },
      
      // User getters
      getUserById: (id) => get().users.find(user => user.id === id),
      getUsersByRole: (role) => get().users.filter(user => user.role === role),
      getActiveUsers: () => get().users.filter(user => user.status === 'active'),
    }),
    {
      name: 'rupagency-crm-storage',
      // NE PERSISTER QUE les préférences utilisateur, PAS les données métier
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isDarkMode: state.isDarkMode,
        featuredContent: state.featuredContent,
        // NE PAS persister : companies, calls, appointments, users, stats
      }),
    }
  )
);

export default useStore; 