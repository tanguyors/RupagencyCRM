import React, { useState } from 'react';
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
import { mockCompanies } from '../data/mockData';
import toast from 'react-hot-toast';

const CallForm = () => {
  const navigate = useNavigate();
  const { companyId } = useParams();
  const { companies, addCall } = useStore();
  
  // Combine store companies with mock data
  const allCompanies = [...companies, ...mockCompanies];
  const company = allCompanies.find(c => c.id === parseInt(companyId));

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
        <Button onClick={() => navigate('/companies')} className="mt-4">
          Retour aux entreprises
        </Button>
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