import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Mail, 
  Globe, 
  User, 
  FileText,
  Save,
  ArrowLeft
} from 'lucide-react';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const AddCompany = () => {
  const navigate = useNavigate();
  const addCompany = useStore(state => state.addCompany);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: '',
    postalCode: '',
    country: 'France',
    siren: '',
    manager: '',
    sector: '',
    email: '',
    website: '',
    size: '',
    notes: ''
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'entreprise est obligatoire';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (formData.website && !formData.website.startsWith('http')) {
      newErrors.website = 'L\'URL doit commencer par http:// ou https://';
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

    const companyData = {
      ...formData,
      status: 'Prospect',
      assignedTo: useStore.getState().user?.id || 1,
    };

    addCompany(companyData);
    toast.success('Entreprise ajoutée avec succès !');
    navigate('/companies');
  };

  const sectors = [
    'Technologie', 'Marketing', 'Conseil', 'Finance', 'Santé', 
    'Éducation', 'Commerce', 'Industrie', 'Services', 'Autre'
  ];

  const sizes = [
    '1-5', '5-10', '10-50', '50-100', '100-500', '500+'
  ];

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
              Ajouter une entreprise
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              Créez une nouvelle fiche entreprise
            </p>
          </div>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations principales */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Informations principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nom de l'entreprise"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: TechSolutions SARL"
                required
                error={errors.name}
              />
              <Input
                label="Téléphone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="01 42 34 56 78"
                icon={<Phone className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Adresse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Paris"
              />
              <Input
                label="Code postal"
                value={formData.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
                placeholder="75001"
              />
              <Input
                label="Pays"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="France"
              />
            </div>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Informations légales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SIREN"
                value={formData.siren}
                onChange={(e) => handleChange('siren', e.target.value)}
                placeholder="123456789"
              />
              <Input
                label="Gérant"
                value={formData.manager}
                onChange={(e) => handleChange('manager', e.target.value)}
                placeholder="Jean Dupont"
                icon={<User className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Informations business */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Informations business
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Secteur d'activité
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => handleChange('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un secteur</option>
                  {sectors.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Taille de l'entreprise
                </label>
                <select
                  value={formData.size}
                  onChange={(e) => handleChange('size', e.target.value)}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner une taille</option>
                  {sizes.map(size => (
                    <option key={size} value={size}>{size} employés</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@entreprise.fr"
                error={errors.email}
              />
              <Input
                label="Site web"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://www.entreprise.fr"
                error={errors.website}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Informations complémentaires, contexte, besoins identifiés..."
              rows="4"
              className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-dark-200 dark:border-dark-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/companies')}
            >
              Annuler
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Valider et enregistrer
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddCompany; 