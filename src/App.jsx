import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store/useStore';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import AddCompany from './pages/AddCompany';
import CompanyDetail from './pages/CompanyDetail';
import CallForm from './pages/CallForm';
import Calls from './pages/Calls';
import CallExecute from './pages/CallExecute';
import Appointments from './pages/Appointments';
import AppointmentDetail from './pages/AppointmentDetail';
import AddAppointment from './pages/AddAppointment';
import Stats from './pages/Stats';
import Admin from './pages/Admin';
import AddUser from './pages/AddUser';
import EditUser from './pages/EditUser';
import UserDetail from './pages/UserDetail';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useStore(state => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  const { isAuthenticated, isDarkMode, initializeData, checkAuth } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is authenticated
        const isAuth = await checkAuth();
        if (isAuth) {
          // Load initial data only if authenticated
          await initializeData();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [checkAuth, initializeData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-cream-100 dark:from-dark-900 dark:to-dark-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-dark-600 dark:text-dark-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider>
      <Router>
        <div className="App">
          <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Companies />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/add" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AddCompany />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/:id/call" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CallForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/calls" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Calls />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/calls/add" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CallForm />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/calls/:id/execute" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CallExecute />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/appointments" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Appointments />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/appointments/add" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AddAppointment />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/appointments/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AppointmentDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/stats" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Stats />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Layout>
                  <Admin />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/add" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AddUser />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/:id/edit" 
            element={
              <ProtectedRoute>
                <Layout>
                  <EditUser />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/:id" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          <Route 
            path="*" 
            element={<Navigate to="/dashboard" replace />} 
          />
          </Routes>
        </div>
      </Router>
    </LanguageProvider>
  );
};

export default App; 