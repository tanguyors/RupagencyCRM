import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Award, 
  Activity,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import useStore from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Admin = () => {
  const navigate = useNavigate();
  const { calls, appointments, users, deleteUser } = useStore();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock admin data
  const adminStats = {
    totalUsers: 12,
    activeUsers: 8,
    totalCalls: calls.length,
    totalAppointments: appointments.length,
    conversionRate: 23.5,
    totalRevenue: 125000
  };

  // Use real users from store, but add some computed fields for display
  const displayUsers = users.map(user => ({
    ...user,
    calls: calls.filter(call => call.userId === user.id).length,
    appointments: appointments.filter(app => app.userId === user.id).length,
    revenue: user.stats?.totalRevenue || 0,
    status: user.status || 'active'
  }));

  const activityLog = [
    { id: 1, user: 'Jean Dupont', action: t('newCompanyAdded'), target: 'TechCorp', timestamp: '2024-01-15 14:30' },
    { id: 2, user: 'Marie Martin', action: t('callCompleted'), target: 'InnovSoft', timestamp: '2024-01-15 14:25' },
    { id: 3, user: 'Jean Dupont', action: t('appointmentCreated'), target: 'TechCorp', timestamp: '2024-01-15 14:20' },
    { id: 4, user: 'Pierre Durand', action: t('companyDeleted'), target: 'OldCorp', timestamp: '2024-01-15 14:15' },
  ];

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: TrendingUp },
    { id: 'users', label: t('users'), icon: Users },
    { id: 'ranking', label: t('userRanking'), icon: Award },
    { id: 'activity', label: t('activityLog'), icon: Activity },
  ];

  const getLevelBadge = (level) => {
    const colors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-purple-100 text-purple-800',
      5: 'bg-yellow-100 text-yellow-800',
      6: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[level] || colors[1]}`}>
        {t('level')} {level}
      </span>
    );
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">Utilisateurs actifs</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{adminStats.activeUsers}/{adminStats.totalUsers}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">Total appels</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{adminStats.totalCalls}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">RDV fixés</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{adminStats.totalAppointments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">Taux conversion</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{adminStats.conversionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">Activité récente</h3>
        <div className="space-y-3">
          {activityLog.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-dark-900 dark:text-cream-50">{activity.user}</p>
                <p className="text-xs text-dark-600 dark:text-dark-400">{activity.action} - {activity.target}</p>
              </div>
              <span className="text-xs text-dark-500 dark:text-dark-400">{activity.timestamp}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const UsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50">Gestion des utilisateurs</h3>
        <Button onClick={() => navigate('/admin/users/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter utilisateur
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">Utilisateur</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">Rôle</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">Performance</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayUsers.map((user) => (
                <tr key={user.id} className="border-b border-dark-100 dark:border-dark-800">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-dark-900 dark:text-cream-50">{user.name}</p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">{user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Closer'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <p>{user.calls} appels • {user.appointments} RDV</p>
                      <p className="text-dark-600 dark:text-dark-400">{user.revenue.toLocaleString()}€ CA</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button 
                        className="p-1 text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-green-600 hover:text-green-800"
                        onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-1 text-red-600 hover:text-red-800"
                        onClick={() => {
                          if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
                            deleteUser(user.id);
                          }
                        }}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const RankingTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50">Classement gamifié</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <h4 className="text-md font-semibold text-dark-900 dark:text-cream-50 mb-4">Top Performers</h4>
          <div className="space-y-3">
            {displayUsers
              .sort((a, b) => b.revenue - a.revenue)
              .slice(0, 5)
              .map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-dark-900 dark:text-cream-50">{user.name}</p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">{user.revenue.toLocaleString()}€ CA</p>
                    </div>
                  </div>
                  {getLevelBadge(user.level)}
                </div>
              ))}
          </div>
        </Card>

        {/* XP Ranking */}
        <Card>
          <h4 className="text-md font-semibold text-dark-900 dark:text-cream-50 mb-4">Classement XP</h4>
          <div className="space-y-3">
            {displayUsers
              .sort((a, b) => b.xp - a.xp)
              .slice(0, 5)
              .map((user, index) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-dark-900 dark:text-cream-50">{user.name}</p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">{user.xp} XP</p>
                    </div>
                  </div>
                  {getLevelBadge(user.level)}
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const ActivityTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50">Journal d'activité</h3>
      
      <Card>
        <div className="space-y-4">
          {activityLog.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-dark-50 dark:bg-dark-700 rounded-lg">
              <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-dark-900 dark:text-cream-50">{activity.user}</p>
                  <span className="text-sm text-dark-500 dark:text-dark-400">{activity.timestamp}</span>
                </div>
                <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                  {activity.action} - <span className="font-medium">{activity.target}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">Administration</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            Gestion globale du CRM et des utilisateurs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-dark-200 dark:border-dark-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'users' && <UsersTab />}
        {activeTab === 'ranking' && <RankingTab />}
        {activeTab === 'activity' && <ActivityTab />}
      </div>
    </div>
  );
};

export default Admin; 