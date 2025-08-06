import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Shield,
  Save,
  ArrowLeft,
  Award
} from 'lucide-react';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const AddUser = () => {
  const navigate = useNavigate();
  const { users, addUser } = useStore();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'closer',
    status: 'active',
    level: 1,
    xp: 0,
    badges: []
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis';
    }

    // Check if email already exists
    const emailExists = users.some(user => user.email === formData.email);
    if (emailExists) {
      newErrors.email = 'Cet email est déjà utilisé';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newUser = {
      id: Date.now(), // Simple ID generation
      ...formData,
      calls: 0,
      appointments: 0,
      revenue: 0,
      createdAt: new Date().toISOString()
    };

    addUser(newUser);
    navigate('/admin');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin')}
            className="p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
              Ajouter un utilisateur
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              Créer un nouveau compte utilisateur
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Nom complet *
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Jean Dupont"
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jean@rupagency.com"
                  error={errors.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Téléphone *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+33 6 12 34 56 78"
                  error={errors.phone}
                />
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Rôle et statut
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Rôle
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="closer">Closer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Statut
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Gamification Settings */}
          <div>
            <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Paramètres de gamification
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  Niveau initial
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={1}>Niveau 1 - Débutant</option>
                  <option value={2}>Niveau 2 - Intermédiaire</option>
                  <option value={3}>Niveau 3 - Avancé</option>
                  <option value={4}>Niveau 4 - Expert</option>
                  <option value={5}>Niveau 5 - Maître</option>
                  <option value={6}>Niveau 6 - Légende</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-2">
                  XP initial
                </label>
                <Input
                  type="number"
                  name="xp"
                  value={formData.xp}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-dark-200 dark:border-dark-700">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/admin')}
            >
              Annuler
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Créer l'utilisateur
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddUser; 