import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MapPin,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import useStore from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockCompanies } from '../data/mockData';
import toast from 'react-hot-toast';

const Companies = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { companies, deleteCompany } = useStore();
  const { t } = useLanguage();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  // Check if we're in "call mode"
  const isCallMode = new URLSearchParams(location.search).get('action') === 'call';

  // Combine store companies with mock data for demo
  const allCompanies = useMemo(() => [...companies, ...mockCompanies], [companies]);

  const filteredCompanies = useMemo(() => {
    return allCompanies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.manager?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || company.status === statusFilter;
      const matchesSector = !sectorFilter || company.sector === sectorFilter;
      const matchesCity = !cityFilter || company.city === cityFilter;
      
      return matchesSearch && matchesStatus && matchesSector && matchesCity;
    });
  }, [allCompanies, searchTerm, statusFilter, sectorFilter, cityFilter]);

  const handleDelete = (id) => {
    if (window.confirm(t('confirmDelete'))) {
      deleteCompany(id);
      toast.success(t('companyDeleted'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Prospect': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Lead': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Client': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const sectors = [...new Set(allCompanies.map(c => c.sector).filter(Boolean))];
  const cities = [...new Set(allCompanies.map(c => c.city).filter(Boolean))];
  const statuses = ['Prospect', 'Lead', 'Client'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
            {isCallMode ? t('selectCompanyForCall') : t('companies')}
          </h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            {isCallMode ? t('clickCompanyToStartCall') : t('manageProspectsAndClients')}
          </p>
        </div>
        {!isCallMode && (
          <Button onClick={() => navigate('/companies/add')}>
            <Plus className="w-4 h-4 mr-2" />
            {t('addCompany')}
          </Button>
        )}
      </div>

      {/* Call Mode Alert */}
      {isCallMode && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center">
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {t('activeCallMode')}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                Sélectionnez une entreprise dans la liste ci-dessous pour commencer un appel téléphonique.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tous les statuts</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          
          <select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            className="px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tous les secteurs</option>
            {sectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Toutes les villes</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setSectorFilter('');
              setCityFilter('');
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-dark-600 dark:text-dark-400">
          {filteredCompanies.length} entreprise{filteredCompanies.length > 1 ? 's' : ''} trouvée{filteredCompanies.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Companies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-1">
                  {company.name}
                </h3>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(company.status)}`}>
                  {company.status}
                </span>
              </div>
              <div className="flex space-x-2">
                {isCallMode ? (
                  <Button
                    onClick={() => navigate(`/companies/${company.id}/call`)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Appeler
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/companies/${company.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(company.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {company.manager && (
                <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                  <span className="font-medium mr-2">Gérant:</span>
                  {company.manager}
                </div>
              )}
              
              {company.sector && (
                <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                  <Building2 className="w-4 h-4 mr-2" />
                  {company.sector}
                </div>
              )}
              
              {company.city && (
                <div className="flex items-center text-sm text-dark-600 dark:text-dark-400">
                  <MapPin className="w-4 h-4 mr-2" />
                  {company.city}
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
            </div>

            {company.notes && (
              <div className="text-sm text-dark-600 dark:text-dark-400 bg-cream-50 dark:bg-dark-700 p-3 rounded-lg">
                <p className="line-clamp-2">{company.notes}</p>
              </div>
            )}
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card className="text-center py-12">
          <Building2 className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50 mb-2">
            Aucune entreprise trouvée
          </h3>
          <p className="text-dark-600 dark:text-dark-400 mb-4">
            Essayez de modifier vos critères de recherche
          </p>
          <Button onClick={() => navigate('/companies/add')}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter votre première entreprise
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Companies; 