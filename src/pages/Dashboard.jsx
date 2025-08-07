import React, { useState } from 'react';
import { 
  TrendingUp, 
  Phone, 
  Calendar, 
  Building2, 
  DollarSign,
  Edit3,
  Check
} from 'lucide-react';
import useStore from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, featuredContent, updateFeaturedContent, companies, calls, appointments } = useStore();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(featuredContent);

  const handleSaveContent = () => {
    updateFeaturedContent(tempContent);
    setIsEditing(false);
    toast.success('Contenu mis à jour !');
  };

  // Calculer les vraies statistiques
  const today = new Date().toISOString().split('T')[0];
  const todayCalls = calls.filter(call => 
    call.scheduledDateTime?.startsWith(today)
  ).length;
  
  const todayAppointments = appointments.filter(appointment => 
    appointment.date?.startsWith(today)
  ).length;

  const totalCompanies = companies.length;
  const totalRevenue = appointments.length * 2000; // Estimation: 2000€ par RDV

  const dashboardStats = [
    {
      title: t('todayCalls'),
      value: todayCalls.toString(),
      change: todayCalls > 0 ? `+${todayCalls}` : '0',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: t('appointmentsSet'),
      value: todayAppointments.toString(),
      change: todayAppointments > 0 ? `+${todayAppointments}` : '0',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: t('companiesAdded'),
      value: totalCompanies.toString(),
      change: totalCompanies > 0 ? `+${totalCompanies}` : '0',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: t('revenueGenerated'),
      value: `€${totalRevenue.toLocaleString()}`,
      change: totalRevenue > 0 ? '+15%' : '0%',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
            Bonjour, {user?.name} 👋
          </h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            Voici un aperçu de vos performances aujourd'hui
          </p>
        </div>
      </div>

      {/* Featured Content */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-cream-50">
            À la une
          </h2>
          {user?.role === 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          )}
        </div>
        
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={tempContent}
              onChange={(e) => setTempContent(e.target.value)}
              className="w-full p-3 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 resize-none"
              rows="3"
            />
            <div className="flex space-x-2">
              <Button onClick={handleSaveContent}>
                <Check className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-dark-700 dark:text-dark-300 text-lg leading-relaxed">
            {featuredContent}
          </p>
        )}
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-dark-900 dark:text-cream-50 mt-1">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            RDV du jour
          </h3>
          <div className="space-y-3">
            {todayAppointments > 0 ? (
              appointments
                .filter(appointment => appointment.date?.startsWith(today))
                .slice(0, 3)
                .map((appointment) => {
                  const company = companies.find(c => c.id === appointment.companyId);
                  return (
                    <div key={appointment.id} className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-cream-50">
                          {company?.name || 'Entreprise inconnue'}
                        </p>
                        <p className="text-sm text-dark-600 dark:text-dark-400">
                          {new Date(appointment.date).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })} - {appointment.briefing?.substring(0, 30)}...
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.status === 'Confirmé' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        appointment.status === 'En attente' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-dark-400 mx-auto mb-2" />
                <p className="text-dark-600 dark:text-dark-400">
                  Aucun rendez-vous aujourd'hui
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Companies */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Dernières entreprises
          </h3>
          <div className="space-y-3">
            {companies.length > 0 ? (
              companies
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
                .map((company) => {
                  const timeAgo = (() => {
                    const now = new Date();
                    const created = new Date(company.createdAt);
                    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
                    
                    if (diffHours < 1) return 'À l\'instant';
                    if (diffHours < 24) return `Il y a ${diffHours}h`;
                    if (diffHours < 48) return 'Hier';
                    return `Il y a ${Math.floor(diffHours / 24)}j`;
                  })();

                  return (
                    <div key={company.id} className="flex items-center justify-between p-3 bg-cream-100 dark:bg-dark-700 rounded-lg">
                      <div>
                        <p className="font-medium text-dark-900 dark:text-cream-50">
                          {company.name}
                        </p>
                        <p className="text-sm text-dark-600 dark:text-dark-400">
                          {company.city} • {company.sector}
                        </p>
                      </div>
                      <span className="text-xs text-dark-500 dark:text-dark-400">
                        {timeAgo}
                      </span>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-dark-400 mx-auto mb-2" />
                <p className="text-dark-600 dark:text-dark-400">
                  Aucune entreprise ajoutée
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 