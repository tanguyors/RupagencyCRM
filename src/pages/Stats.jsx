import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Phone, 
  Calendar, 
  DollarSign, 
  Target, 
  Award,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';

const Stats = () => {
  const { 
    companies, 
    calls, 
    appointments, 
    users, 
    user, 
    isAdmin 
  } = useStore();

  // Utiliser useMemo pour éviter les recalculs inutiles
  const allUsers = useMemo(() => users, [users]);
  const allCompanies = useMemo(() => companies, [companies]);
  const allCalls = useMemo(() => calls, [calls]);
  const allAppointments = useMemo(() => appointments, [appointments]);

  // Statistiques globales
  const globalStats = useMemo(() => {
    const totalCalls = allCalls.length;
    const totalAppointments = allAppointments.length;
    const totalCompanies = allCompanies.length;
    const totalUsers = allUsers.length;
    
    const conversionRate = totalCalls > 0 ? (totalAppointments / totalCalls * 100).toFixed(1) : 0;
    
    // Calculer le CA estimé (exemple: 100€ par RDV)
    const estimatedRevenue = totalAppointments * 100;
    
    return {
      totalCalls,
      totalAppointments,
      totalCompanies,
      totalUsers,
      conversionRate,
      estimatedRevenue
    };
  }, [allCalls, allAppointments, allCompanies, allUsers]);

  // Statistiques personnelles (pour les closers)
  const personalStats = useMemo(() => {
    if (!user) return null;
    
    const userCalls = allCalls.filter(call => call.userId === user.id);
    const userAppointments = allAppointments.filter(appointment => appointment.userId === user.id);
    const userCompanies = allCompanies.filter(company => company.assignedTo === user.id);
    
    const totalCalls = userCalls.length;
    const totalAppointments = userAppointments.length;
    const totalCompanies = userCompanies.length;
    
    const conversionRate = totalCalls > 0 ? (totalAppointments / totalCalls * 100).toFixed(1) : 0;
    const estimatedRevenue = totalAppointments * 100;
    
    return {
      totalCalls,
      totalAppointments,
      totalCompanies,
      conversionRate,
      estimatedRevenue
    };
  }, [allCalls, allAppointments, allCompanies, user]);

  // Données pour les graphiques
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const dayCalls = allCalls.filter(call => 
        format(new Date(call.scheduledDateTime), 'yyyy-MM-dd') === dateStr
      ).length;
      
      const dayAppointments = allAppointments.filter(appointment => 
        format(new Date(appointment.date), 'yyyy-MM-dd') === dateStr
      ).length;
      
      return {
        date: format(date, 'dd/MM', { locale: fr }),
        calls: dayCalls,
        appointments: dayAppointments
      };
    }).reverse();

    return { last7Days };
  }, [allCalls, allAppointments]);

  // Données pour le graphique en secteurs
  const sectorData = useMemo(() => {
    const sectorCount = {};
    allCompanies.forEach(company => {
      const sector = company.sector || 'Autre';
      sectorCount[sector] = (sectorCount[sector] || 0) + 1;
    });

    return Object.entries(sectorCount).map(([sector, count]) => ({
      name: sector,
      value: count
    }));
  }, [allCompanies]);

  // Couleurs pour les graphiques
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  // Statistiques par utilisateur (pour les admins)
  const userStats = useMemo(() => {
    if (!isAdmin) return [];
    
    return allUsers.map(user => {
      const userCalls = allCalls.filter(call => call.userId === user.id);
      const userAppointments = allAppointments.filter(appointment => appointment.userId === user.id);
      
      return {
        id: user.id,
        name: user.name,
        calls: userCalls.length,
        appointments: userAppointments.length,
        conversionRate: userCalls.length > 0 ? (userAppointments.length / userCalls.length * 100).toFixed(1) : 0
      };
    }).sort((a, b) => b.calls - a.calls);
  }, [allUsers, allCalls, allAppointments, isAdmin]);

  // Statistiques récentes
  const recentStats = useMemo(() => {
    const today = new Date();
    const todayCalls = allCalls.filter(call => 
      format(new Date(call.scheduledDateTime), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    ).length;
    
    const todayAppointments = allAppointments.filter(appointment => 
      format(new Date(appointment.date), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    ).length;
    
    const thisWeekCalls = allCalls.filter(call => {
      const callDate = new Date(call.scheduledDateTime);
      return callDate >= startOfDay(subDays(today, 7)) && callDate <= endOfDay(today);
    }).length;
    
    const thisWeekAppointments = allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startOfDay(subDays(today, 7)) && appointmentDate <= endOfDay(today);
    }).length;
    
    return {
      todayCalls,
      todayAppointments,
      thisWeekCalls,
      thisWeekAppointments
    };
  }, [allCalls, allAppointments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
            Statistiques
          </h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            Analysez vos performances et celles de votre équipe
          </p>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                Total Appels
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {globalStats.totalCalls}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                Total RDV
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {globalStats.totalAppointments}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                Taux de conversion
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {globalStats.conversionRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                CA estimé
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {globalStats.estimatedRevenue.toLocaleString()}€
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Statistiques personnelles (pour les closers) */}
      {personalStats && (
        <Card>
          <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-6 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Mes statistiques personnelles
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {personalStats.totalCalls}
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400">Appels</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {personalStats.totalAppointments}
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400">RDV</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {personalStats.totalCompanies}
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400">Entreprises</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {personalStats.conversionRate}%
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400">Conversion</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {personalStats.estimatedRevenue.toLocaleString()}€
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400">CA estimé</p>
            </div>
          </div>
        </Card>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des 7 derniers jours */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Évolution des 7 derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.last7Days}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="calls" fill="#3B82F6" name="Appels" />
              <Bar dataKey="appointments" fill="#10B981" name="RDV" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Répartition par secteur */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Répartition par secteur
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Statistiques par utilisateur (pour les admins) */}
      {isAdmin && userStats.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Performance par utilisateur
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">
                    Utilisateur
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">
                    Appels
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">
                    RDV
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-dark-600 dark:text-dark-400">
                    Conversion
                  </th>
                </tr>
              </thead>
              <tbody>
                {userStats.map((userStat) => (
                  <tr key={userStat.id} className="border-b border-dark-100 dark:border-dark-800">
                    <td className="py-3 px-4 text-sm text-dark-900 dark:text-cream-50">
                      {userStat.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-dark-900 dark:text-cream-50">
                      {userStat.calls}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-dark-900 dark:text-cream-50">
                      {userStat.appointments}
                    </td>
                    <td className="py-3 px-4 text-sm text-center text-dark-900 dark:text-cream-50">
                      {userStat.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Statistiques récentes */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
          Activité récente
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {recentStats.todayCalls}
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">Appels aujourd'hui</p>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {recentStats.todayAppointments}
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">RDV aujourd'hui</p>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {recentStats.thisWeekCalls}
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">Appels cette semaine</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {recentStats.thisWeekAppointments}
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">RDV cette semaine</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Stats; 