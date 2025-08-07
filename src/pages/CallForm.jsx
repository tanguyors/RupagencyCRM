import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Phone, 
  Building2, 
  User, 
  MapPin,
  Mail,
  Globe,
  ArrowLeft
} from 'lucide-react';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import toast from 'react-hot-toast';

const CallForm = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { companies, addCall, fetchCompanies } = useStore();
  
  // Combine store companies with mock data
  const allCompanies = companies;
  const parsedCompanyId = parseInt(companyId);
  const company = allCompanies.find(c => c.id === parsedCompanyId);

  // Forcer le chargement des entreprises si elles ne sont pas disponibles
  useEffect(() => {
    if (allCompanies.length === 0) {
      console.log('Aucune entreprise chargée, tentative de chargement...');
      fetchCompanies().catch(error => {
        console.error('Erreur lors du chargement des entreprises:', error);
        toast.error('Erreur lors du chargement des entreprises');
      });
    }
  }, [allCompanies.length, fetchCompanies]);

  // Debug: afficher les informations pour diagnostiquer le problème
  console.log('CallForm Debug:', {
    companyId,
    parsedCompanyId,
    companiesCount: allCompanies.length,
    companies: allCompanies.map(c => ({ id: c.id, name: c.name })),
    foundCompany: company
  });

  const [callData, setCallData] = useState({
    type: 'Prospection',
    scheduledDate: '',
    scheduledTime: '',
    notes: '',
    priority: 'Normal'
  });



  const callTypes = ['Prospection', 'Contrôle qualité', 'SAV'];
  const priorities = ['Basse', 'Normal', 'Haute', 'Urgente'];

  const handleCallSubmit = (e) => {
    e.preventDefault();
    
    if (!callData.scheduledDate || !callData.scheduledTime) {
      toast.error('Veuillez sélectionner une date et une heure pour programmer l\'appel');
      return;
    }

    const call = {
      ...callData,
      scheduledDateTime: `${callData.scheduledDate}T${callData.scheduledTime}:00`,
      companyId: parseInt(companyId),
      userId: useStore.getState().user?.id || 1,
      status: 'Programmé',
      createdAt: new Date().toISOString()
    };

    addCall(call);
    toast.success('Appel programmé avec succès !');
    navigate('/calls');
  };



  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50">
          Entreprise non trouvée
        </h2>
        <p className="text-dark-600 dark:text-dark-400 mt-2 mb-4">
          L'entreprise avec l'ID {companyId} n'a pas été trouvée.
          {allCompanies.length === 0 ? ' Aucune entreprise chargée.' : ` ${allCompanies.length} entreprises disponibles.`}
        </p>
        
        {allCompanies.length > 0 && (
          <div className="mt-6 mb-6">
            <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50 mb-3">
              Entreprises disponibles :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {allCompanies.slice(0, 6).map((availableCompany) => (
                <div key={availableCompany.id} className="p-3 bg-cream-50 dark:bg-dark-700 rounded-lg border">
                  <p className="font-medium text-dark-900 dark:text-cream-50">
                    {availableCompany.name}
                  </p>
                  <p className="text-sm text-dark-600 dark:text-dark-400">
                    ID: {availableCompany.id} • {availableCompany.city}
                  </p>
                  <Button 
                    onClick={() => navigate(`/companies/${availableCompany.id}/call`)}
                    size="sm"
                    className="mt-2 w-full"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    Appeler cette entreprise
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-x-4">
          <Button onClick={() => navigate('/companies')} className="mt-4">
            Retour aux entreprises
          </Button>
          <Button onClick={() => navigate('/companies?action=call')} variant="outline" className="mt-4">
            Choisir une entreprise
          </Button>
        </div>
      </div>
    );
  }

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
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
              Programmer un appel
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              Programmez un appel téléphonique avec cette entreprise
            </p>
          </div>
        </div>
        
        <Button type="submit" form="callForm" className="bg-green-600 hover:bg-green-700">
          <Phone className="w-4 h-4 mr-2" />
          Programmer l'appel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card>
          <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            Informations entreprise
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50">
                {company.name}
              </h3>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                company.status === 'Prospect' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                company.status === 'Lead' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              }`}>
                {company.status}
              </span>
            </div>

            <div className="space-y-2">
              {company.manager && (
                <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                  <User className="w-4 h-4 mr-2" />
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
        </Card>

                 {/* Call Form */}
         <Card>
           <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
             <Phone className="w-5 h-5 mr-2" />
             Programmer l'appel
           </h2>

           <form id="callForm" onSubmit={handleCallSubmit} className="space-y-4">
                         <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                   Date de l'appel
                 </label>
                 <Input
                   type="date"
                   value={callData.scheduledDate}
                   onChange={(e) => setCallData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                   required
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                   Heure de l'appel
                 </label>
                 <Input
                   type="time"
                   value={callData.scheduledTime}
                   onChange={(e) => setCallData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                   required
                 />
               </div>
             </div>

             <div>
               <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                 Type d'appel
               </label>
               <select
                 value={callData.type}
                 onChange={(e) => setCallData(prev => ({ ...prev, type: e.target.value }))}
                 className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
               >
                 {callTypes.map(type => (
                   <option key={type} value={type}>{type}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                 Priorité
               </label>
               <select
                 value={callData.priority}
                 onChange={(e) => setCallData(prev => ({ ...prev, priority: e.target.value }))}
                 className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
               >
                 {priorities.map(priority => (
                   <option key={priority} value={priority}>{priority}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                 Notes pour l'appel
               </label>
               <textarea
                 value={callData.notes}
                 onChange={(e) => setCallData(prev => ({ ...prev, notes: e.target.value }))}
                 placeholder="Points à aborder, objectifs de l'appel, informations importantes..."
                 rows="4"
                 className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
               />
             </div>
          </form>
        </Card>
      </div>

      
    </div>
  );
};

export default CallForm; 