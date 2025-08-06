import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Building2, 
  Save,
  ArrowLeft
} from 'lucide-react';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import toast from 'react-hot-toast';

const AddAppointment = () => {
  const navigate = useNavigate();
  const { companies, addAppointment, isAuthenticated } = useStore();
  
  // Vérifier l'authentification
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Veuillez vous connecter pour créer un rendez-vous');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Combine store companies with mock data
  const allCompanies = companies;

  const [formData, setFormData] = useState({
    companyId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ':'),
    briefing: '',
    status: 'En attente'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyId) {
      newErrors.companyId = 'Veuillez sélectionner une entreprise';
    }
    
    if (!formData.date) {
      newErrors.date = 'Veuillez sélectionner une date';
    }
    
    if (!formData.time) {
      newErrors.time = 'Veuillez sélectionner une heure';
    }
    
    if (!formData.briefing.trim()) {
      newErrors.briefing = 'Veuillez ajouter un briefing pour le RDV';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      return;
    }

    const appointment = {
      ...formData,
      companyId: parseInt(formData.companyId),
      date: new Date(`${formData.date}T${formData.time}:00`).toISOString(),
      userId: useStore.getState().user?.id || 1,
      createdAt: new Date().toISOString()
    };

    addAppointment(appointment);
    toast.success('Rendez-vous créé avec succès !');
    navigate('/appointments');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/appointments')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'agenda
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
              Nouveau rendez-vous
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              Créez un nouveau rendez-vous avec un client
            </p>
          </div>
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-6 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Informations du rendez-vous
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Entreprise *
            </label>
            <select
              value={formData.companyId}
              onChange={(e) => handleChange('companyId', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                errors.companyId 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-dark-300 dark:border-dark-600'
              }`}
            >
              <option value="">Sélectionner une entreprise</option>
              {allCompanies.map(company => (
                <option key={company.id} value={company.id}>
                  {company.name} - {company.city}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="text-red-500 text-sm mt-1">{errors.companyId}</p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Date *
              </label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={errors.date ? 'border-red-500 dark:border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-red-500 text-sm mt-1">{errors.date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                Heure *
              </label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => handleChange('time', e.target.value)}
                className={errors.time ? 'border-red-500 dark:border-red-500' : ''}
              />
              {errors.time && (
                <p className="text-red-500 text-sm mt-1">{errors.time}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="En attente">En attente</option>
              <option value="Confirmé">Confirmé</option>
              <option value="Annulé">Annulé</option>
            </select>
          </div>

          {/* Briefing */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
              Briefing *
            </label>
            <textarea
              value={formData.briefing}
              onChange={(e) => handleChange('briefing', e.target.value)}
              placeholder="Points à aborder, objectifs du RDV, contexte..."
              rows="4"
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${
                errors.briefing 
                  ? 'border-red-500 dark:border-red-500' 
                  : 'border-dark-300 dark:border-dark-600'
              }`}
            />
            {errors.briefing && (
              <p className="text-red-500 text-sm mt-1">{errors.briefing}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              Créer le rendez-vous
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/appointments')}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Card>

      {/* Selected Company Info */}
      {formData.companyId && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Informations de l'entreprise sélectionnée
          </h3>
          
          {(() => {
            const selectedCompany = allCompanies.find(c => c.id === parseInt(formData.companyId));
            if (!selectedCompany) return null;
            
            return (
              <div className="space-y-2">
                <div>
                  <h4 className="font-medium text-dark-900 dark:text-cream-50">
                    {selectedCompany.name}
                  </h4>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    selectedCompany.status === 'Prospect' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    selectedCompany.status === 'Lead' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {selectedCompany.status}
                  </span>
                </div>
                
                {selectedCompany.manager && (
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    <strong>Gérant:</strong> {selectedCompany.manager}
                  </p>
                )}
                
                {selectedCompany.phone && (
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    <strong>Téléphone:</strong> {selectedCompany.phone}
                  </p>
                )}
                
                {selectedCompany.email && (
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    <strong>Email:</strong> {selectedCompany.email}
                  </p>
                )}
                
                {selectedCompany.city && (
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    <strong>Adresse:</strong> {selectedCompany.city}, {selectedCompany.postalCode}
                  </p>
                )}
                
                {selectedCompany.notes && (
                  <div className="bg-cream-50 dark:bg-dark-700 p-3 rounded-lg">
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                      <strong>Notes:</strong> {selectedCompany.notes}
                    </p>
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

export default AddAppointment; 