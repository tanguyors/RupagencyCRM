import React, { useState, useMemo } from 'react';
import { 
  Phone, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Calendar,
  User,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const Calls = () => {
  const navigate = useNavigate();
  const { calls, companies, deleteCall } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const company = companies.find(c => c.id === call.companyId);
             const matchesSearch = !searchTerm || 
         (company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          call.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
      
             const matchesStatus = statusFilter === 'all' || call.status === statusFilter;
      const matchesType = typeFilter === 'all' || call.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [calls, companies, searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status) => {
    const colors = {
      'Programmé': 'bg-blue-100 text-blue-800',
      'En cours': 'bg-yellow-100 text-yellow-800',
      'Terminé': 'bg-green-100 text-green-800',
      'Annulé': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors['Programmé']}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Basse': 'bg-gray-100 text-gray-800',
      'Normal': 'bg-blue-100 text-blue-800',
      'Haute': 'bg-orange-100 text-orange-800',
      'Urgente': 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors['Normal']}`}>
        {priority}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const colors = {
      'Prospection': 'bg-blue-100 text-blue-800',
      'Contrôle qualité': 'bg-purple-100 text-purple-800',
      'SAV': 'bg-orange-100 text-orange-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || colors['Prospection']}`}>
        {type}
      </span>
    );
  };



  const formatScheduledDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteCall = (callId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet appel ?')) {
      deleteCall(callId);
      toast.success('Appel supprimé avec succès');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">Appels</h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            Gestion et suivi des appels téléphoniques
          </p>
        </div>
        <Button onClick={() => navigate('/companies?action=call')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvel appel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-dark-400" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
                     <select
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="input-field"
           >
             <option value="all">Tous les statuts</option>
             <option value="Programmé">Programmé</option>
             <option value="En cours">En cours</option>
             <option value="Terminé">Terminé</option>
             <option value="Annulé">Annulé</option>
           </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">Tous les types</option>
            <option value="Prospection">Prospection</option>
            <option value="Contrôle qualité">Contrôle qualité</option>
            <option value="SAV">SAV</option>
          </select>
          
          <div className="text-sm text-dark-600 dark:text-dark-400 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            {filteredCalls.length} résultat{filteredCalls.length !== 1 ? 's' : ''}
          </div>
        </div>
      </Card>

      {/* Calls List */}
      <div className="space-y-4">
        {filteredCalls.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Phone className="w-12 h-12 text-dark-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50 mb-2">
                Aucun appel trouvé
              </h3>
              <p className="text-dark-600 dark:text-dark-400">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Essayez de modifier vos filtres de recherche'
                  : 'Commencez par ajouter votre premier appel'
                }
              </p>
            </div>
          </Card>
        ) : (
          filteredCalls.map((call) => {
            const company = companies.find(c => c.id === call.companyId);
            return (
              <Card key={call.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-dark-900 dark:text-cream-50">
                          {company?.name || 'Entreprise inconnue'}
                        </h3>
                                                 <div className="flex items-center space-x-4 text-sm text-dark-600 dark:text-dark-400">
                           <span className="flex items-center">
                             <Calendar className="w-4 h-4 mr-1" />
                             {formatScheduledDate(call.scheduledDateTime)}
                           </span>
                           <span className="flex items-center">
                             <User className="w-4 h-4 mr-1" />
                             {call.priority}
                           </span>
                         </div>
                      </div>
                    </div>
                    
                                         <div className="flex items-center space-x-3 mb-3">
                       {getTypeBadge(call.type)}
                       {getStatusBadge(call.status)}
                       {getPriorityBadge(call.priority)}
                     </div>
                     
                     {call.notes && (
                       <p className="text-sm text-dark-700 dark:text-dark-300 bg-dark-50 dark:bg-dark-700 p-3 rounded-lg">
                         {call.notes}
                       </p>
                     )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button 
                      onClick={() => navigate(`/companies/${call.companyId}`)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Voir l'entreprise"
                    >
                      <Building2 className="w-4 h-4" />
                    </button>
                                         {call.status === 'Programmé' && (
                       <button 
                         onClick={() => navigate(`/calls/${call.id}/execute`)}
                         className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                         title="Démarrer l'appel"
                       >
                         <Phone className="w-4 h-4" />
                       </button>
                     )}
                     {call.status === 'En cours' && (
                       <button 
                         onClick={() => navigate(`/calls/${call.id}/execute`)}
                         className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                         title="Terminer l'appel"
                       >
                         <Phone className="w-4 h-4" />
                       </button>
                     )}
                     <button 
                       onClick={() => navigate(`/companies/${call.companyId}/call`)}
                       className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                       title="Modifier l'appel"
                     >
                       <Edit className="w-4 h-4" />
                     </button>
                    <button 
                      onClick={() => handleDeleteCall(call.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Supprimer l'appel"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Calls; 