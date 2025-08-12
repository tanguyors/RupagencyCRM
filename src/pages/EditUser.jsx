import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  User, 
  Shield,
  Save,
  ArrowLeft,
  Trash2,
  Award
} from 'lucide-react';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const EditUser = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { users, updateUser, deleteUser, fetchUsers } = useStore();
  
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    const loadUserData = async () => {
      // Si la liste des utilisateurs est vide, la charger depuis l'API
      if (users.length === 0) {
        try {
          await fetchUsers();
        } catch (error) {
          console.error('Erreur lors du chargement des utilisateurs:', error);
          toast.error('Erreur lors du chargement des utilisateurs');
          navigate('/admin');
          return;
        }
      }

      const user = users.find(u => u.id === parseInt(id));
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          role: user.role || 'closer',
          status: user.status || 'active',
          level: user.level || 1,
          xp: user.xp || 0,
          badges: user.badges || []
        });
      } else {
        // User not found, redirect to admin
        toast.error('Utilisateur non trouvé');
        navigate('/admin');
      }
    };

    loadUserData();
  }, [id, users, navigate, fetchUsers]);

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

    // Check if email already exists (excluding current user)
    const emailExists = users.some(user => 
      user.email === formData.email && user.id !== parseInt(id)
    );
    if (emailExists) {
      newErrors.email = 'Cet email est déjà utilisé';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await updateUser(parseInt(id), formData);
      toast.success('Utilisateur modifié avec succès !');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la modification de l\'utilisateur');
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteUser(parseInt(id));
      toast.success('Utilisateur supprimé avec succès !');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la suppression de l\'utilisateur');
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const user = users.find(u => u.id === parseInt(userId));
  if (!user) {
    return null; // Will redirect in useEffect
  }

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
              Modifier l'utilisateur
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              Modifier les informations de {user.name}
            </p>
          </div>
        </div>
        
        {/* Delete Button */}
        <Button
          variant="ghost"
          onClick={() => setShowDeleteConfirm(true)}
          className="text-red-600 hover:text-red-800 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4">
                Confirmer la suppression
              </h3>
              <p className="text-dark-600 dark:text-dark-400 mb-6">
                Êtes-vous sûr de vouloir supprimer l'utilisateur "{user.name}" ? 
                Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Supprimer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

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
                  Niveau
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
                  XP
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
              Sauvegarder
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditUser; 