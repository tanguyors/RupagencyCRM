import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  ArrowLeft,
  Edit,
  Trash2,
  Star,
  Trophy,
  Zap,
  Activity
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, subDays, subMonths, isWithinInterval, parseISO, eachDayOfInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const UserDetail = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { users, calls, appointments, companies, deleteUser } = useStore();
  const [timeRange, setTimeRange] = useState('30d');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const user = users.find(u => u.id === parseInt(userId));
  
  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Calculate date range based on timeRange
  const getDateRange = () => {
    const end = new Date();
    let start;
    
    switch (timeRange) {
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      case '90d':
        start = subDays(end, 90);
        break;
      case '12m':
        start = subMonths(end, 12);
        break;
      default:
        start = subDays(end, 30);
    }
    
    return { start, end };
  };

  const dateRange = getDateRange();

  // Filter data for this user and time range
  const userCalls = calls.filter(call => 
    call.userId === user.id && 
    isWithinInterval(parseISO(call.createdAt), { start: dateRange.start, end: dateRange.end })
  );

  const userAppointments = appointments.filter(app => 
    app.userId === user.id && 
    isWithinInterval(parseISO(app.createdAt), { start: dateRange.start, end: dateRange.end })
  );

  // Calculate statistics
  const stats = {
    totalCalls: userCalls.length,
    totalAppointments: userAppointments.length,
    conversionRate: userCalls.length > 0 ? (userAppointments.length / userCalls.length * 100).toFixed(1) : 0,
    totalRevenue: user.stats?.totalRevenue || 0,
    averageCallDuration: 12.5, // Mock data
    successRate: 78.5, // Mock data
  };

  // Generate time series data for calls and appointments
  const generateTimeSeriesData = () => {
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayCalls = userCalls.filter(call => 
        call.createdAt.startsWith(dayStr)
      ).length;
      const dayAppointments = userAppointments.filter(app => 
        app.createdAt.startsWith(dayStr)
      ).length;
      
      return {
        date: format(day, 'dd/MM', { locale: fr }),
        calls: dayCalls,
        appointments: dayAppointments,
      };
    });
  };

  // Generate call outcomes data
  const generateCallOutcomes = () => {
    const outcomes = [
      { name: 'RDV fixé', value: userAppointments.length, color: '#10B981' },
      { name: 'Intéressé', value: Math.floor(userCalls.length * 0.3), color: '#3B82F6' },
      { name: 'À relancer', value: Math.floor(userCalls.length * 0.2), color: '#F59E0B' },
      { name: 'Non intéressé', value: Math.floor(userCalls.length * 0.5), color: '#EF4444' },
    ];
    
    return outcomes.filter(outcome => outcome.value > 0);
  };

  // Generate sector performance data
  const generateSectorPerformance = () => {
    const sectorMap = {};
    
    userCalls.forEach(call => {
      const company = companies.find(c => c.id === call.companyId);
      if (company) {
        sectorMap[company.sector] = (sectorMap[company.sector] || 0) + 1;
      }
    });
    
    return Object.entries(sectorMap).map(([sector, count]) => ({
      sector,
      calls: count,
      appointments: userAppointments.filter(app => {
        const company = companies.find(c => c.id === app.companyId);
        return company && company.sector === sector;
      }).length,
    }));
  };

  // Recent activity
  const recentActivity = [
    ...userCalls.map(call => ({
      id: call.id,
      type: 'call',
      action: 'Appel effectué',
      target: companies.find(c => c.id === call.companyId)?.name || 'Entreprise inconnue',
      timestamp: call.createdAt,
      icon: Phone,
    })),
    ...userAppointments.map(app => ({
      id: app.id,
      type: 'appointment',
      action: 'RDV créé',
      target: companies.find(c => c.id === app.companyId)?.name || 'Entreprise inconnue',
      timestamp: app.createdAt,
      icon: Calendar,
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

  const handleDelete = () => {
    deleteUser(user.id);
    navigate('/admin');
  };

  const timeSeriesData = generateTimeSeriesData();
  const callOutcomes = generateCallOutcomes();
  const sectorPerformance = generateSectorPerformance();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
              Profil de {user.name}
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              Statistiques détaillées et performance
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
            className="text-green-600 hover:text-green-800"
          >
            <Edit className="w-4 h-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                Êtes-vous sûr de vouloir supprimer l'utilisateur "{user.name}" ? 
                Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* User Info Card */}
      <Card>
        <div className="flex items-start space-x-6">
          <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {user.avatar || user.name.charAt(0)}
            </span>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h2 className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {user.name}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'admin' ? 'Admin' : 'Closer'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {user.status === 'active' ? 'Actif' : 'Inactif'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-dark-400" />
                <span className="text-dark-600 dark:text-dark-400">{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-dark-400" />
                <span className="text-dark-600 dark:text-dark-400">{user.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-dark-400" />
                <span className="text-dark-600 dark:text-dark-400">Niveau {user.level} • {user.xp} XP</span>
              </div>
            </div>
            
            {user.badges && user.badges.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">Badges :</p>
                <div className="flex space-x-2">
                  {user.badges.map((badge, index) => (
                    <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50">
          Statistiques de performance
        </h3>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50"
        >
          <option value="7d">7 derniers jours</option>
          <option value="30d">30 derniers jours</option>
          <option value="90d">90 derniers jours</option>
          <option value="12m">12 derniers mois</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">Appels effectués</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{stats.totalCalls}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">RDV fixés</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{stats.totalAppointments}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">Taux conversion</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{stats.conversionRate}%</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-dark-600 dark:text-dark-400">CA généré</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">{stats.totalRevenue.toLocaleString()}€</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <Card>
          <h4 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Évolution des appels et RDV
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="calls" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="appointments" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Call Outcomes Pie Chart */}
        <Card>
          <h4 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Résultats des appels
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={callOutcomes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {callOutcomes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Sector Performance */}
      {sectorPerformance.length > 0 && (
        <Card>
          <h4 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Performance par secteur d'activité
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="sector" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#3B82F6" name="Appels" />
              <Bar dataKey="appointments" fill="#10B981" name="RDV" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <h4 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
          Activité récente
        </h4>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-4 p-3 bg-dark-50 dark:bg-dark-700 rounded-lg">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <activity.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-dark-900 dark:text-cream-50">
                  {activity.action}
                </p>
                <p className="text-xs text-dark-600 dark:text-dark-400">
                  {activity.target}
                </p>
              </div>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                {format(parseISO(activity.timestamp), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default UserDetail; 