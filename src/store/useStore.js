import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockUsers, mockCompanies, mockCalls, mockAppointments } from '../data/mockData';

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      
      // Theme
      isDarkMode: false,
      
      // Language
      language: 'fr',
      
      // Data
      companies: mockCompanies,
      calls: mockCalls,
      appointments: mockAppointments,
      users: mockUsers,
      stats: {
        totalCalls: 0,
        totalAppointments: 0,
        conversionRate: 0,
        totalRevenue: 0,
      },
      
      // Featured content
      featuredContent: "Bienvenue sur votre CRM Rupagency ! Prêt à optimiser vos performances ?",
      
      // Actions
      login: (userData) => set({
        user: userData,
        isAuthenticated: true,
        isAdmin: userData.role === 'admin',
      }),
      
      logout: () => set({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
      }),
      
      toggleTheme: () => set((state) => ({
        isDarkMode: !state.isDarkMode,
      })),
      
      setLanguage: (language) => set({
        language,
      }),
      
      // Companies
      addCompany: (company) => set((state) => ({
        companies: [...state.companies, { ...company, id: Date.now(), createdAt: new Date().toISOString() }],
      })),
      
      updateCompany: (id, updates) => set((state) => ({
        companies: state.companies.map(company => 
          company.id === id ? { ...company, ...updates } : company
        ),
      })),
      
      deleteCompany: (id) => set((state) => ({
        companies: state.companies.filter(company => company.id !== id),
      })),
      
      // Calls
      addCall: (call) => set((state) => ({
        calls: [...state.calls, { ...call, id: Date.now(), createdAt: new Date().toISOString() }],
      })),
      
      updateCall: (id, updates) => set((state) => ({
        calls: state.calls.map(call => 
          call.id === id ? { ...call, ...updates } : call
        ),
      })),
      
      deleteCall: (id) => set((state) => ({
        calls: state.calls.filter(call => call.id !== id),
      })),
      
      // Appointments
      addAppointment: (appointment) => set((state) => ({
        appointments: [...state.appointments, { ...appointment, id: Date.now(), createdAt: new Date().toISOString() }],
      })),
      
      updateAppointment: (id, updates) => set((state) => ({
        appointments: state.appointments.map(appointment => 
          appointment.id === id ? { ...appointment, ...updates } : appointment
        ),
      })),
      
      deleteAppointment: (id) => set((state) => ({
        appointments: state.appointments.filter(appointment => appointment.id !== id),
      })),
      
      // Users
      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: Date.now(), createdAt: new Date().toISOString() }],
      })),
      
      updateUser: (id, updates) => set((state) => ({
        users: state.users.map(user => 
          user.id === id ? { ...user, ...updates } : user
        ),
      })),
      
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(user => user.id !== id),
      })),
      
      // Stats
      updateStats: (newStats) => set({
        stats: { ...get().stats, ...newStats },
      }),
      
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
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
        isDarkMode: state.isDarkMode,
        language: state.language,
        companies: state.companies,
        calls: state.calls,
        appointments: state.appointments,
        users: state.users,
        featuredContent: state.featuredContent,
      }),
    }
  )
);

export default useStore; 