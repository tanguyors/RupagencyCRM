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
  const { user, featuredContent, updateFeaturedContent } = useStore();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(featuredContent);

  const handleSaveContent = () => {
    updateFeaturedContent(tempContent);
    setIsEditing(false);
    toast.success('Contenu mis à jour !');
  };

  const stats = [
    {
      title: t('todayCalls'),
      value: '12',
      change: '+2',
      icon: Phone,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: t('appointmentsSet'),
      value: '3',
      change: '+1',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: t('companiesAdded'),
      value: '5',
      change: '+2',
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: t('revenueGenerated'),
      value: '€2,400',
      change: '+15%',
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
        {stats.map((stat, index) => (
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
            <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div>
                <p className="font-medium text-dark-900 dark:text-cream-50">
                  TechSolutions SARL
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  14:00 - Présentation solutions
                </p>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded-full">
                Confirmé
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cream-100 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="font-medium text-dark-900 dark:text-cream-50">
                  Marketing Pro
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  10:30 - Démo produit
                </p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs rounded-full">
                En attente
              </span>
            </div>
          </div>
        </Card>

        {/* Recent Companies */}
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
            Dernières entreprises
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-cream-100 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="font-medium text-dark-900 dark:text-cream-50">
                  Consulting Plus
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  Toulouse • Conseil
                </p>
              </div>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                Il y a 2h
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-cream-100 dark:bg-dark-700 rounded-lg">
              <div>
                <p className="font-medium text-dark-900 dark:text-cream-50">
                  Marketing Pro
                </p>
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  Lyon • Marketing
                </p>
              </div>
              <span className="text-xs text-dark-500 dark:text-dark-400">
                Hier
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 