import React, { useEffect } from 'react';
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
  const { isAuthenticated, isDarkMode } = useStore();

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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
            path="/companies/:companyId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyDetail />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/companies/:companyId/call" 
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
            path="/calls/:callId/execute" 
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
            path="/appointments/:appointmentId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <AppointmentDetail />
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
            path="/admin/users/:userId/edit" 
            element={
              <ProtectedRoute>
                <Layout>
                  <EditUser />
                </Layout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/users/:userId" 
            element={
              <ProtectedRoute>
                <Layout>
                  <UserDetail />
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
          
          {/* Redirect root to dashboard */}
          <Route 
            path="/" 
            element={<Navigate to="/dashboard" replace />} 
          />
          
          {/* Catch all route */}
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