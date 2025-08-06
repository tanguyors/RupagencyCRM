import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Clock, 
  Users, 
  TrendingUp, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Eye,
  PhoneCall,
  CalendarDays
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import useStore from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import toast from 'react-hot-toast';

const CompanyDetail = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { companies, updateCompany, deleteCompany } = useStore();
  const { t } = useLanguage();
  
  // Combine store data with mock data
  const allCompanies = companies;
  const allCalls = useStore.getState().calls;
  const allAppointments = useStore.getState().appointments;
  
  const company = allCompanies.find(c => c.id === parseInt(companyId));
  const companyCalls = allCalls.filter(call => call.companyId === parseInt(companyId));
  const companyAppointments = allAppointments.filter(appointment => appointment.companyId === parseInt(companyId));

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: company?.name || '',
    manager: company?.manager || '',
    phone: company?.phone || '',
    email: company?.email || '',
    city: company?.city || '',
    postalCode: company?.postalCode || '',
    sector: company?.sector || '',
    status: company?.status || 'Prospect',
    notes: company?.notes || ''
  });

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50">
          {t('companyNotFound')}
        </h2>
        <Button onClick={() => navigate('/companies')} className="mt-4">
          {t('back')} {t('companies').toLowerCase()}
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Prospect': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Lead': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Client': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleDelete = () => {
    if (window.confirm(`${t('confirmDelete')} "${company.name}" ?`)) {
      deleteCompany(company.id);
      toast.success(t('companyDeleted'));
      navigate('/companies');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!editData.name) {
      toast.error(t('nameRequired'));
      return;
    }

    updateCompany(company.id, editData);
    toast.success(t('companyUpdated'));
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/companies')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('back')} {t('companies').toLowerCase()}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
              {company.name}
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              {t('companyDetails')}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate(`/companies/${company.id}/call`)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Phone className="w-4 h-4 mr-2" />
            {t('addCall')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? t('cancel') : t('edit')}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('delete')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card>
          <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            {t('companyDetails')}
          </h2>
          
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  {t('companyName')} *
                </label>
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    {t('manager')}
                  </label>
                  <input
                    type="text"
                    value={editData.manager}
                    onChange={(e) => setEditData(prev => ({ ...prev, manager: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Prospect">Prospect</option>
                    <option value="Lead">Lead</option>
                    <option value="Client">Client</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    {t('phone')}
                  </label>
                  <input
                    type="tel"
                    value={editData.phone}
                    onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editData.email}
                    onChange={(e) => setEditData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={editData.city}
                    onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={editData.postalCode}
                    onChange={(e) => setEditData(prev => ({ ...prev, postalCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  value={editData.sector}
                  onChange={(e) => setEditData(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={editData.notes}
                  onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <Button type="submit" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50">
                  {company.name}
                </h3>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(company.status)}`}>
                  {company.status}
                </span>
              </div>

              <div className="space-y-2">
                {company.manager && (
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <Users className="w-4 h-4 mr-2" />
                    <span className="font-medium mr-2">Gérant:</span>
                    {company.manager}
                  </div>
                )}
                
                {company.phone && (
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <Phone className="w-4 h-4 mr-2" />
                    {company.phone}
                  </div>
                )}
                
                {company.email && (
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <Mail className="w-4 h-4 mr-2" />
                    {company.email}
                  </div>
                )}
                
                {company.city && (
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.city}, {company.postalCode}
                  </div>
                )}
                
                {company.sector && (
                  <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                    <Globe className="w-4 h-4 mr-2" />
                    {company.sector}
                  </div>
                )}
              </div>

              {company.notes && (
                <div className="bg-cream-50 dark:bg-dark-700 p-3 rounded-lg">
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    <strong>Notes:</strong> {company.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Activity */}
        <Card>
          <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Activité récente
          </h2>
          
          <div className="space-y-4">
            {/* Recent Calls */}
            <div>
              <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50 mb-2 flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                Appels récents ({companyCalls.length})
              </h3>
              {companyCalls.length > 0 ? (
                <div className="space-y-2">
                  {companyCalls.slice(0, 3).map((call) => (
                    <div key={call.id} className="p-3 bg-cream-50 dark:bg-dark-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dark-900 dark:text-cream-50">
                            {call.type}
                          </p>
                          <p className="text-xs text-dark-600 dark:text-dark-400">
                            {format(parseISO(call.scheduledDateTime), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          call.status === 'Terminé' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          call.status === 'En cours' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        }`}>
                          {call.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  Aucun appel programmé
                </p>
              )}
            </div>

            {/* Recent Appointments */}
            <div>
              <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50 mb-2 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Rendez-vous ({companyAppointments.length})
              </h3>
              {companyAppointments.length > 0 ? (
                <div className="space-y-2">
                  {companyAppointments.slice(0, 3).map((appointment) => (
                    <div key={appointment.id} className="p-3 bg-cream-50 dark:bg-dark-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-dark-900 dark:text-cream-50">
                            {format(parseISO(appointment.date), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                          </p>
                          <p className="text-xs text-dark-600 dark:text-dark-400">
                            {appointment.briefing?.substring(0, 50)}...
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.status === 'Confirmé' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          appointment.status === 'En attente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  Aucun rendez-vous programmé
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDetail; 