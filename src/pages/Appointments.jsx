import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Building2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

import toast from 'react-hot-toast';

const Appointments = () => {
  const navigate = useNavigate();
  const { appointments, deleteAppointment, updateAppointment } = useStore();
  
  const [currentDate, setCurrentDate] = useState(new Date());

  // Combine store appointments with mock data
  const allAppointments = appointments;
  const allCompanies = useStore.getState().companies;
  


  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  


  const getAppointmentsForDate = (date) => {
    return allAppointments.filter(appointment => {
      try {
        const appointmentDate = parseISO(appointment.date);
        const isSame = isSameDay(appointmentDate, date);

        return isSame;
      } catch (error) {
        console.error('Error parsing appointment date:', appointment.date, error);
        return false;
      }
    });
  };

  const getCompanyName = (companyId) => {
    const company = allCompanies.find(c => c.id === companyId);
    return company?.name || 'Entreprise inconnue';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmé': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'En attente': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Annulé': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    updateAppointment(appointmentId, { status: newStatus });
    toast.success('Statut mis à jour');
  };

  const handleDelete = (appointmentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce RDV ?')) {
      deleteAppointment(appointmentId);
      toast.success('RDV supprimé');
    }
  };

  const timeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
            Agenda
          </h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            Gérez vos rendez-vous et votre planning
          </p>
        </div>
        <Button onClick={() => navigate('/appointments/add')}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau RDV
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setCurrentDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() - 7);
                return newDate;
              })}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <h2 className="text-lg font-semibold text-dark-900 dark:text-cream-50">
              {format(weekStart, 'dd MMMM yyyy', { locale: fr })} - {format(weekEnd, 'dd MMMM yyyy', { locale: fr })}
            </h2>
            
            <Button
              variant="ghost"
              onClick={() => setCurrentDate(prev => {
                const newDate = new Date(prev);
                newDate.setDate(prev.getDate() + 7);
                return newDate;
              })}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd'hui
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date('2024-01-22'))}
            >
              Semaine des RDV (22-28 jan)
            </Button>
          </div>
        </div>

        {/* Week Calendar */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header with days */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-2"></div> {/* Time column header */}
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-center border-b border-dark-200 dark:border-dark-700 ${
                    isSameDay(day, new Date()) 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' 
                      : 'text-dark-600 dark:text-dark-400'
                  }`}
                >
                  <div className="text-sm font-medium">
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div className="text-lg font-bold">
                    {format(day, 'd')}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots */}
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 gap-1 border-b border-dark-100 dark:border-dark-800">
                <div className="p-2 text-sm text-dark-500 dark:text-dark-400 text-right pr-4">
                  {time}
                </div>
                                 {weekDays.map((day) => {
                                       const dayAppointments = getAppointmentsForDate(day).filter(
                      apt => {
                        try {
                          const appointmentTime = format(parseISO(apt.date), 'HH:mm');
                          const appointmentHour = parseInt(appointmentTime.split(':')[0]);
                          const slotHour = parseInt(time.split(':')[0]);
                          
                          // Show appointment in the closest time slot
                          return appointmentHour === slotHour || 
                                 (appointmentHour >= slotHour && appointmentHour < slotHour + 1);
                        } catch (error) {
                          console.error('Error parsing appointment date:', apt.date, error);
                          return false;
                        }
                      }
                    );
                  
                  return (
                    <div
                      key={`${day.toISOString()}-${time}`}
                      className="p-1 min-h-[60px] border-l border-dark-100 dark:border-dark-800"
                    >
                      {dayAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mb-1 cursor-pointer hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors border border-primary-200 dark:border-primary-700"
                          onClick={() => navigate(`/appointments/${appointment.id}`)}
                        >
                                                     <div className="text-xs font-medium text-primary-800 dark:text-primary-200 truncate">
                             {getCompanyName(appointment.companyId)}
                           </div>
                           <div className="text-xs text-primary-600 dark:text-primary-300 truncate">
                             {format(parseISO(appointment.date), 'HH:mm')} - {appointment.briefing?.substring(0, 20)}...
                           </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className={`text-xs px-1 py-0.5 rounded ${getStatusColor(appointment.status)}`}>
                              {appointment.status}
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(appointment.id, 'Confirmé');
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(appointment.id);
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>



      {/* Today's Appointments */}
      <Card>
        <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          RDV d'aujourd'hui
        </h3>
        
        <div className="space-y-3">
          {getAppointmentsForDate(new Date()).length > 0 ? (
            getAppointmentsForDate(new Date()).map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-700 rounded-lg hover:bg-cream-100 dark:hover:bg-dark-600 transition-colors cursor-pointer"
                onClick={() => navigate(`/appointments/${appointment.id}`)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-dark-900 dark:text-cream-50">
                      {getCompanyName(appointment.companyId)}
                    </h4>
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                      {format(parseISO(appointment.date), 'HH:mm')} - {appointment.briefing?.substring(0, 50)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                    {appointment.status}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/companies/${appointment.companyId}`);
                    }}
                  >
                    <Building2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-dark-400 mx-auto mb-4" />
              <p className="text-dark-600 dark:text-dark-400">
                Aucun RDV prévu aujourd'hui
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Appointments; 