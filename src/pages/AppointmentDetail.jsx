import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  ArrowLeft, 
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { mockCompanies, mockAppointments } from '../data/mockData';
import toast from 'react-hot-toast';

const AppointmentDetail = () => {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const { appointments, updateAppointment, deleteAppointment } = useStore();
  
  // Combine store appointments with mock data
  const allAppointments = [...appointments, ...mockAppointments];
  const allCompanies = [...useStore.getState().companies, ...mockCompanies];
  
  const appointment = allAppointments.find(a => a.id === parseInt(appointmentId));
  const company = appointment ? allCompanies.find(c => c.id === appointment.companyId) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    date: appointment ? format(parseISO(appointment.date), 'yyyy-MM-dd') : '',
    time: appointment ? format(parseISO(appointment.date), 'HH:mm') : '',
    briefing: appointment?.briefing || '',
    status: appointment?.status || 'En attente'
  });

  if (!appointment || !company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50">
          Rendez-vous non trouvé
        </h2>
        <Button onClick={() => navigate('/appointments')} className="mt-4">
          Retour à l'agenda
        </Button>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmé': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'En attente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Annulé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleStatusChange = (newStatus) => {
    updateAppointment(appointment.id, { status: newStatus });
    toast.success('Statut mis à jour');
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce RDV ?')) {
      deleteAppointment(appointment.id);
      toast.success('RDV supprimé');
      navigate('/appointments');
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    
    if (!editData.date || !editData.time) {
      toast.error('Veuillez remplir la date et l\'heure');
      return;
    }

    const updatedAppointment = {
      ...appointment,
      date: new Date(`${editData.date}T${editData.time}:00`).toISOString(),
      briefing: editData.briefing,
      status: editData.status
    };

    updateAppointment(appointment.id, updatedAppointment);
    toast.success('RDV mis à jour');
    setIsEditing(false);
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
              Détails du RDV
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              {company.name} - {format(parseISO(appointment.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Details */}
        <Card>
          <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Informations RDV
          </h2>
          
          {isEditing ? (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={editData.time}
                    onChange={(e) => setEditData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Statut
                </label>
                <select
                  value={editData.status}
                  onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="En attente">En attente</option>
                  <option value="Confirmé">Confirmé</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                  Briefing
                </label>
                <textarea
                  value={editData.briefing}
                  onChange={(e) => setEditData(prev => ({ ...prev, briefing: e.target.value }))}
                  rows="4"
                  className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <Button type="submit" className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  <span className="text-lg font-medium text-dark-900 dark:text-cream-50">
                    {format(parseISO(appointment.date), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </span>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              {appointment.briefing && (
                <div className="bg-cream-50 dark:bg-dark-700 p-4 rounded-lg">
                  <h3 className="font-medium text-dark-900 dark:text-cream-50 mb-2">Briefing</h3>
                  <p className="text-dark-600 dark:text-dark-400 whitespace-pre-wrap">
                    {appointment.briefing}
                  </p>
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('Confirmé')}
                  disabled={appointment.status === 'Confirmé'}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange('Annulé')}
                  disabled={appointment.status === 'Annulé'}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </div>
          )}
        </Card>

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
            </div>

            {company.notes && (
              <div className="bg-cream-50 dark:bg-dark-700 p-3 rounded-lg">
                <p className="text-sm text-dark-600 dark:text-dark-400">
                  <strong>Notes:</strong> {company.notes}
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => navigate(`/companies/${company.id}`)}
              className="w-full"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Voir l'entreprise
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentDetail; 