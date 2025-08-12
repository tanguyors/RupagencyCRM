import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Phone, 
  Building2, 
  User, 
  MapPin,
  Mail,
  Globe,
  ArrowLeft,
  Calendar,
  CheckCircle,
  XCircle,
  Save
} from 'lucide-react';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import toast from 'react-hot-toast';

const CallExecute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { calls, companies, updateCall, addAppointment, fetchCalls, fetchCompanies } = useStore();
  
  // Combine store companies with mock data
  const allCompanies = companies;
  const allCalls = calls;
  const call = allCalls.find(c => c.id === parseInt(id));
  const company = call ? allCompanies.find(c => c.id === call.companyId) : null;

  // Forcer le chargement des données si elles ne sont pas disponibles
  useEffect(() => {
    const loadData = async () => {
      // Charger les appels si la liste est vide OU si l'appel spécifique n'est pas présent
      if (allCalls.length === 0 || !call) {
        console.log('Chargement des appels depuis l\'API...');
        try {
          await fetchCalls();
        } catch (error) {
          console.error('Erreur lors du chargement des appels:', error);
          toast.error('Erreur lors du chargement des appels');
        }
      }
      
      // Charger les entreprises si la liste est vide OU si l'entreprise de l'appel n'est pas présente
      if (allCompanies.length === 0 || (call && !company)) {
        console.log('Chargement des entreprises depuis l\'API...');
        try {
          await fetchCompanies();
        } catch (error) {
          console.error('Erreur lors du chargement des entreprises:', error);
          toast.error('Erreur lors du chargement des entreprises');
        }
      }
    };

    loadData();
  }, [allCalls.length, allCompanies.length, call, company, fetchCalls, fetchCompanies]);

  // Debug: afficher les informations pour diagnostiquer le problème
  console.log('CallExecute Debug:', {
    callId: id,
    parsedCallId: parseInt(id),
    callsCount: allCalls.length,
    companiesCount: allCompanies.length,
    calls: allCalls.map(c => ({ id: c.id, companyId: c.companyId, status: c.status })),
    foundCall: call,
    foundCompany: company
  });

  const [isCallActive, setIsCallActive] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [showResultForm, setShowResultForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  
  const [callResult, setCallResult] = useState({
    issue: '',
    summary: '',
    duration: 0
  });

  const [appointmentData, setAppointmentData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }).replace(':', ':'),
    briefing: ''
  });

  // Update appointment briefing when call result changes
  useEffect(() => {
    if (callResult.summary) {
      setAppointmentData(prev => ({
        ...prev,
        briefing: callResult.summary
      }));
    }
  }, [callResult.summary]);

  const callIssues = ['RDV fixé', 'Rappel', 'Refus', 'Pas de réponse'];

  // Timer effect
  useEffect(() => {
    let interval;
    if (isCallActive && callStartTime) {
      interval = setInterval(() => {
        const duration = Math.round((Date.now() - callStartTime) / 1000 / 60); // minutes
        setCallDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive, callStartTime]);

  const startCall = () => {
    setIsCallActive(true);
    setCallStartTime(Date.now());
    updateCall(parseInt(id), { status: 'En cours' });
    toast.success('Appel démarré !');
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallResult(prev => ({ ...prev, duration: callDuration }));
    setShowResultForm(true);
  };

  const handleResultSubmit = (e) => {
    e.preventDefault();
    
    if (!callResult.issue) {
      toast.error('Veuillez sélectionner un résultat d\'appel');
      return;
    }

    const updatedCall = {
      ...call,
      ...callResult,
      status: 'Terminé',
      completedAt: new Date().toISOString()
    };

    updateCall(parseInt(id), updatedCall);
    toast.success('Appel terminé et enregistré !');

    if (callResult.issue === 'RDV fixé') {
      // Show appointment form instead of auto-creating
      setShowResultForm(false);
      setShowAppointmentForm(true);
    } else {
      navigate('/calls');
    }
  };

  const handleAppointmentSubmit = (e) => {
    e.preventDefault();
    
    if (!appointmentData.date || !appointmentData.time) {
      toast.error('Veuillez remplir la date et l\'heure du RDV');
      return;
    }

    const appointment = {
      ...appointmentData,
      date: new Date(`${appointmentData.date}T${appointmentData.time}:00`).toISOString(),
      companyId: call.companyId,
      userId: useStore.getState().user?.id || 1,
      status: 'En attente',
      createdAt: new Date().toISOString()
    };

    addAppointment(appointment);
    toast.success('RDV créé avec succès !');
    navigate('/appointments');
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins.toString().padStart(2, '0')}` : `${mins}min`;
  };

  if (!call || !company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50">
          Appel non trouvé
        </h2>
        <p className="text-dark-600 dark:text-dark-400 mt-2 mb-4">
          L'appel avec l'ID {id} n'a pas été trouvé.
          {allCalls.length === 0 ? ' Aucun appel chargé.' : ` ${allCalls.length} appels disponibles.`}
          {call && !company ? ' Entreprise de l\'appel non trouvée.' : ''}
        </p>
        
        {allCalls.length > 0 && (
          <div className="mt-6 mb-6">
            <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50 mb-3">
              Appels disponibles :
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {allCalls.slice(0, 6).map(c => (
                <div key={c.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <div className="font-medium">ID: {c.id}</div>
                  <div>Company ID: {c.companyId}</div>
                  <div>Status: {c.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="space-x-4">
          <Button onClick={() => navigate('/calls')} className="mt-4">
            Retour aux appels
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Recharger la page
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
            onClick={() => navigate('/calls')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
              {isCallActive ? 'Appel en cours' : 'Exécuter l\'appel'}
            </h1>
            <p className="text-dark-600 dark:text-dark-400 mt-1">
              {isCallActive ? 'Appel téléphonique en cours avec ' + company.name : 'Prêt à appeler ' + company.name}
            </p>
          </div>
        </div>
        
        {!isCallActive && call.status === 'Programmé' && (
          <Button onClick={startCall} className="bg-green-600 hover:bg-green-700">
            <Phone className="w-4 h-4 mr-2" />
            Démarrer l'appel
          </Button>
        )}
        
        {isCallActive && (
          <Button onClick={endCall} variant="danger">
            <XCircle className="w-4 h-4 mr-2" />
            Terminer l'appel
          </Button>
        )}
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

            {call.notes && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Notes pour l'appel:</strong> {call.notes}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Call Status */}
        <Card>
          <h2 className="text-xl font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Statut de l'appel
          </h2>

          {isCallActive && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center justify-between text-green-800 dark:text-green-300">
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Appel en cours...
                </div>
                <div className="text-lg font-mono">
                  {formatDuration(callDuration)}
                </div>
              </div>
            </div>
          )}

          {showResultForm && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50">
                Résultat de l'appel
              </h3>
              
              <form onSubmit={handleResultSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Résultat de l'appel
                  </label>
                  <select
                    value={callResult.issue}
                    onChange={(e) => setCallResult(prev => ({ ...prev, issue: e.target.value }))}
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Sélectionner un résultat</option>
                    {callIssues.map(issue => (
                      <option key={issue} value={issue}>{issue}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">
                    Résumé de l'appel
                  </label>
                  <textarea
                    value={callResult.summary}
                    onChange={(e) => setCallResult(prev => ({ ...prev, summary: e.target.value }))}
                    placeholder="Détails de la conversation, points abordés, prochaines étapes..."
                    rows="4"
                    className="w-full px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer le résultat
                </Button>
              </form>
            </div>
          )}

          {showAppointmentForm && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-dark-900 dark:text-cream-50 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Créer un RDV
              </h3>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-4">
                  L'appel a été marqué comme "RDV fixé". Veuillez maintenant créer le RDV avec les détails appropriés.
                </p>
                
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Date
                      </label>
                      <Input
                        type="date"
                        value={appointmentData.date}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                        Heure
                      </label>
                      <Input
                        type="time"
                        value={appointmentData.time}
                        onChange={(e) => setAppointmentData(prev => ({ ...prev, time: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      Briefing
                    </label>
                    <textarea
                      value={appointmentData.briefing}
                      onChange={(e) => setAppointmentData(prev => ({ ...prev, briefing: e.target.value }))}
                      placeholder="Points à aborder, objectifs du RDV..."
                      rows="3"
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Créer le RDV
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setShowAppointmentForm(false);
                        navigate('/calls');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CallExecute; 