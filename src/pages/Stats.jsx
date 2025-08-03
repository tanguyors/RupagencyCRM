import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Phone, 
  Calendar, 
  DollarSign,
  Trophy,
  Award,
  Star,
  Clock,
  MapPin,
  Building2,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap,
  Activity,
  PieChart as PieChartIcon,
  LineChart,
  BarChart,
  Calendar as CalendarIcon,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Legend
} from 'recharts';
import { format, subDays, subWeeks, subMonths, startOfDay, endOfDay, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import useStore from '../store/useStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { mockStats, mockUsers, mockCompanies, mockCalls, mockAppointments } from '../data/mockData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Stats = () => {
  const { user, isAdmin, companies, calls, appointments } = useStore();
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, 1y
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, quarter, year

  // Combine store data with mock data
  const allCompanies = [...companies, ...mockCompanies];
  const allCalls = [...calls, ...mockCalls];
  const allAppointments = [...appointments, ...mockAppointments];
  const allUsers = mockUsers.filter(u => u.role === 'closer');

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7d': return { start: subDays(now, 7), end: now };
      case '30d': return { start: subDays(now, 30), end: now };
      case '90d': return { start: subDays(now, 90), end: now };
      case '1y': return { start: subMonths(now, 12), end: now };
      default: return { start: subDays(now, 30), end: now };
    }
  };

  const dateRange = getDateRange();

  // Filter data by date range and user role
  const filteredCalls = useMemo(() => {
    let calls = allCalls.filter(call => {
      const callDate = parseISO(call.scheduledDateTime);
      return isWithinInterval(callDate, { start: dateRange.start, end: dateRange.end });
    });
    
    // If user is not admin, only show their own calls
    if (!isAdmin && user) {
      calls = calls.filter(call => call.userId === user.id);
    }
    
    return calls;
  }, [allCalls, dateRange, isAdmin, user]);

  const filteredAppointments = useMemo(() => {
    let appointments = allAppointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.date);
      return isWithinInterval(appointmentDate, { start: dateRange.start, end: dateRange.end });
    });
    
    // If user is not admin, only show their own appointments
    if (!isAdmin && user) {
      appointments = appointments.filter(appointment => appointment.userId === user.id);
    }
    
    return appointments;
  }, [allAppointments, dateRange, isAdmin, user]);

  // Calculate detailed statistics
  const detailedStats = useMemo(() => {
    const totalCalls = filteredCalls.length;
    const totalAppointments = filteredAppointments.length;
    const completedCalls = filteredCalls.filter(call => call.status === 'Terminé').length;
    const confirmedAppointments = filteredAppointments.filter(apt => apt.status === 'Confirmé').length;
    
    // Calculate conversion rates
    const callToAppointmentRate = totalCalls > 0 ? (totalAppointments / totalCalls) * 100 : 0;
    const appointmentToConfirmedRate = totalAppointments > 0 ? (confirmedAppointments / totalAppointments) * 100 : 0;
    
    // Calculate average call duration
    const callsWithDuration = filteredCalls.filter(call => call.duration);
    const avgCallDuration = callsWithDuration.length > 0 
      ? callsWithDuration.reduce((sum, call) => sum + (call.duration || 0), 0) / callsWithDuration.length 
      : 0;

    // Calculate revenue (mock calculation)
    const totalRevenue = confirmedAppointments * 1500; // Average revenue per confirmed appointment

    // Calculate trends (compare with previous period)
    const previousPeriodStart = new Date(dateRange.start);
    const previousPeriodEnd = new Date(dateRange.end);
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodLength);
    previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodLength);

    let previousCalls = allCalls.filter(call => {
      const callDate = parseISO(call.scheduledDateTime);
      return isWithinInterval(callDate, { start: previousPeriodStart, end: previousPeriodEnd });
    });
    
    let previousAppointments = allAppointments.filter(appointment => {
      const appointmentDate = parseISO(appointment.date);
      return isWithinInterval(appointmentDate, { start: previousPeriodStart, end: previousPeriodEnd });
    });
    
    // If user is not admin, only consider their own data for trends
    if (!isAdmin && user) {
      previousCalls = previousCalls.filter(call => call.userId === user.id);
      previousAppointments = previousAppointments.filter(appointment => appointment.userId === user.id);
    }
    
    const previousCallsCount = previousCalls.length;
    const previousAppointmentsCount = previousAppointments.length;

    const callsGrowth = previousCallsCount > 0 ? ((totalCalls - previousCallsCount) / previousCallsCount) * 100 : 0;
    const appointmentsGrowth = previousAppointmentsCount > 0 ? ((totalAppointments - previousAppointmentsCount) / previousAppointmentsCount) * 100 : 0;

    return {
      totalCalls,
      totalAppointments,
      completedCalls,
      confirmedAppointments,
      callToAppointmentRate,
      appointmentToConfirmedRate,
      avgCallDuration,
      totalRevenue,
      callsGrowth,
      appointmentsGrowth
    };
  }, [filteredCalls, filteredAppointments, dateRange, allCalls, allAppointments]);

  // Generate time series data
  const timeSeriesData = useMemo(() => {
    const days = [];
    const current = new Date(dateRange.start);
    
    while (current <= dateRange.end) {
      const dayStart = startOfDay(current);
      const dayEnd = endOfDay(current);
      
      const dayCalls = filteredCalls.filter(call => {
        const callDate = parseISO(call.scheduledDateTime);
        return isWithinInterval(callDate, { start: dayStart, end: dayEnd });
      }).length;
      
      const dayAppointments = filteredAppointments.filter(appointment => {
        const appointmentDate = parseISO(appointment.date);
        return isWithinInterval(appointmentDate, { start: dayStart, end: dayEnd });
      }).length;
      
      days.push({
        date: format(current, 'dd/MM', { locale: fr }),
        calls: dayCalls,
        appointments: dayAppointments,
        conversion: dayCalls > 0 ? (dayAppointments / dayCalls) * 100 : 0
      });
      
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [filteredCalls, filteredAppointments, dateRange]);

  // Sector analysis
  const sectorAnalysis = useMemo(() => {
    const sectorData = {};
    
    filteredCalls.forEach(call => {
      const company = allCompanies.find(c => c.id === call.companyId);
      if (company?.sector) {
        if (!sectorData[company.sector]) {
          sectorData[company.sector] = { calls: 0, appointments: 0, revenue: 0 };
        }
        sectorData[company.sector].calls++;
      }
    });
    
    filteredAppointments.forEach(appointment => {
      const company = allCompanies.find(c => c.id === appointment.companyId);
      if (company?.sector) {
        if (!sectorData[company.sector]) {
          sectorData[company.sector] = { calls: 0, appointments: 0, revenue: 0 };
        }
        sectorData[company.sector].appointments++;
        if (appointment.status === 'Confirmé') {
          sectorData[company.sector].revenue += 1500;
        }
      }
    });
    
    return Object.entries(sectorData).map(([sector, data]) => ({
      sector,
      calls: data.calls,
      appointments: data.appointments,
      revenue: data.revenue,
      conversion: data.calls > 0 ? (data.appointments / data.calls) * 100 : 0
    }));
  }, [filteredCalls, filteredAppointments, allCompanies]);

  // Performance by user
  const userPerformance = useMemo(() => {
    return allUsers.map(user => {
      const userCalls = filteredCalls.filter(call => call.userId === user.id);
      const userAppointments = filteredAppointments.filter(apt => apt.userId === user.id);
      const completedCalls = userCalls.filter(call => call.status === 'Terminé').length;
      const confirmedAppointments = userAppointments.filter(apt => apt.status === 'Confirmé').length;
      
      return {
        name: user.name,
        calls: userCalls.length,
        appointments: userAppointments.length,
        completedCalls,
        confirmedAppointments,
        conversion: userCalls.length > 0 ? (userAppointments.length / userCalls.length) * 100 : 0,
        revenue: confirmedAppointments * 1500,
        avgCallDuration: userCalls.length > 0 
          ? userCalls.reduce((sum, call) => sum + (call.duration || 0), 0) / userCalls.length 
          : 0
      };
    });
  }, [filteredCalls, filteredAppointments, allUsers]);

  // Call outcomes analysis
  const callOutcomes = useMemo(() => {
    const outcomes = {
      'RDV fixé': 0,
      'Rappel': 0,
      'Refus': 0,
      'Pas de réponse': 0
    };
    
    filteredCalls.forEach(call => {
      if (call.issue && outcomes.hasOwnProperty(call.issue)) {
        outcomes[call.issue]++;
      }
    });
    
    return Object.entries(outcomes).map(([outcome, count]) => ({
      outcome,
      count,
      percentage: filteredCalls.length > 0 ? (count / filteredCalls.length) * 100 : 0
    }));
  }, [filteredCalls]);

  // Geographic analysis
  const geographicAnalysis = useMemo(() => {
    const cityData = {};
    
    filteredCalls.forEach(call => {
      const company = allCompanies.find(c => c.id === call.companyId);
      if (company?.city) {
        if (!cityData[company.city]) {
          cityData[company.city] = { calls: 0, appointments: 0, revenue: 0 };
        }
        cityData[company.city].calls++;
      }
    });
    
    filteredAppointments.forEach(appointment => {
      const company = allCompanies.find(c => c.id === appointment.companyId);
      if (company?.city) {
        if (!cityData[company.city]) {
          cityData[company.city] = { calls: 0, appointments: 0, revenue: 0 };
        }
        cityData[company.city].appointments++;
        if (appointment.status === 'Confirmé') {
          cityData[company.city].revenue += 1500;
        }
      }
    });
    
    return Object.entries(cityData)
      .map(([city, data]) => ({
        city,
        calls: data.calls,
        appointments: data.appointments,
        revenue: data.revenue,
        conversion: data.calls > 0 ? (data.appointments / data.calls) * 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredCalls, filteredAppointments, allCompanies]);

  const getGrowthIcon = (growth) => {
    if (growth > 0) return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (growth < 0) return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getGrowthColor = (growth) => {
    if (growth > 0) return 'text-green-600 dark:text-green-400';
    if (growth < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Top Performer': return <Trophy className="w-4 h-4" />;
      case 'Early Bird': return <Star className="w-4 h-4" />;
      case 'Consistent': return <Award className="w-4 h-4" />;
      case 'Team Player': return <Users className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  // Export functionality
  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPosition = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RupAgency CRM', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport Statistiques', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 20;
    doc.setFontSize(10);
    
    // Report info
    const reportInfo = [
      `Période: ${timeRange === '7d' ? '7 derniers jours' : timeRange === '30d' ? '30 derniers jours' : timeRange === '90d' ? '90 derniers jours' : '12 derniers mois'}`,
      `Date: ${format(dateRange.start, 'dd/MM/yyyy', { locale: fr })} - ${format(dateRange.end, 'dd/MM/yyyy', { locale: fr })}`,
      `Utilisateur: ${user?.name || 'Utilisateur'} (${isAdmin ? 'Admin' : 'Closer'})`,
      `Généré le: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr })}`
    ];
    
    reportInfo.forEach(info => {
      doc.text(info, margin, yPosition);
      yPosition += 8;
    });
    
    yPosition += 15;

    // Key Metrics Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MÉTRIQUES CLÉS', margin, yPosition);
    yPosition += 10;

    const keyMetrics = [
      ['Total Appels', detailedStats.totalCalls.toString()],
      ['RDV Fixés', detailedStats.totalAppointments.toString()],
      ['Taux de Conversion', `${detailedStats.callToAppointmentRate.toFixed(1)}%`],
      ['CA Généré', `€${detailedStats.totalRevenue.toLocaleString()}`],
      ['Appels Terminés', detailedStats.completedCalls.toString()],
      ['RDV Confirmés', detailedStats.confirmedAppointments.toString()],
      ['Durée Moyenne Appel', `${detailedStats.avgCallDuration.toFixed(0)}min`],
      ['Taux Confirmation RDV', `${detailedStats.appointmentToConfirmedRate.toFixed(1)}%`]
    ];

    const keyMetricsResult = autoTable(doc, {
      startY: yPosition,
      head: [['Métrique', 'Valeur']],
      body: keyMetrics,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin }
    });

    yPosition = keyMetricsResult.finalY + 15;

    // Trends Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TENDANCES (vs période précédente)', margin, yPosition);
    yPosition += 10;

    const trends = [
      ['Appels', `${detailedStats.callsGrowth > 0 ? '+' : ''}${detailedStats.callsGrowth.toFixed(1)}%`],
      ['RDV', `${detailedStats.appointmentsGrowth > 0 ? '+' : ''}${detailedStats.appointmentsGrowth.toFixed(1)}%`]
    ];

    const trendsResult = autoTable(doc, {
      startY: yPosition,
      head: [['Métrique', 'Évolution']],
      body: trends,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin }
    });

    yPosition = trendsResult.finalY + 15;

    // Time Series Data
    if (timeSeriesData.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ÉVOLUTION QUOTIDIENNE', margin, yPosition);
      yPosition += 10;

      const timeSeriesTable = timeSeriesData.map(day => [
        day.date,
        day.calls.toString(),
        day.appointments.toString(),
        `${day.conversion.toFixed(1)}%`
      ]);

      const timeSeriesResult = autoTable(doc, {
        startY: yPosition,
        head: [['Date', 'Appels', 'RDV', 'Taux Conversion']],
        body: timeSeriesTable,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin }
      });

      yPosition = timeSeriesResult.finalY + 15;
    }

    // Sector Analysis
    if (sectorAnalysis.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ANALYSE PAR SECTEUR', margin, yPosition);
      yPosition += 10;

      const sectorTable = sectorAnalysis
        .sort((a, b) => b.revenue - a.revenue)
        .map(sector => [
          sector.sector,
          sector.calls.toString(),
          sector.appointments.toString(),
          `${sector.conversion.toFixed(1)}%`,
          `€${sector.revenue.toLocaleString()}`
        ]);

      const sectorResult = autoTable(doc, {
        startY: yPosition,
        head: [['Secteur', 'Appels', 'RDV', 'Conversion', 'CA']],
        body: sectorTable,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPosition = sectorResult.finalY + 15;
    }

    // Call Outcomes
    if (callOutcomes.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RÉSULTATS DES APPELS', margin, yPosition);
      yPosition += 10;

      const outcomesTable = callOutcomes.map(outcome => [
        outcome.outcome,
        outcome.count.toString(),
        `${outcome.percentage.toFixed(1)}%`
      ]);

      const outcomesResult = autoTable(doc, {
        startY: yPosition,
        head: [['Résultat', 'Nombre', 'Pourcentage']],
        body: outcomesTable,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin }
      });

      yPosition = outcomesResult.finalY + 15;
    }

    // User Performance (only for admins)
    if (isAdmin && userPerformance.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PERFORMANCE DES CLOSERS', margin, yPosition);
      yPosition += 10;

      const userTable = userPerformance
        .sort((a, b) => b.revenue - a.revenue)
        .map(performer => [
          performer.name,
          performer.calls.toString(),
          performer.appointments.toString(),
          `${performer.conversion.toFixed(1)}%`,
          `${performer.avgCallDuration.toFixed(0)}min`,
          `€${performer.revenue.toLocaleString()}`
        ]);

      const userResult = autoTable(doc, {
        startY: yPosition,
        head: [['Closer', 'Appels', 'RDV', 'Conversion', 'Durée moy.', 'CA']],
        body: userTable,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 8 },
        margin: { left: margin, right: margin }
      });

      yPosition = userResult.finalY + 15;
    }

    // Geographic Analysis (only for admins)
    if (isAdmin && geographicAnalysis.length > 0) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('ANALYSE GÉOGRAPHIQUE (Top 10)', margin, yPosition);
      yPosition += 10;

      const geoTable = geographicAnalysis.map(city => [
        city.city,
        city.calls.toString(),
        city.appointments.toString(),
        `${city.conversion.toFixed(1)}%`,
        `€${city.revenue.toLocaleString()}`
      ]);

      const geoResult = autoTable(doc, {
        startY: yPosition,
        head: [['Ville', 'Appels', 'RDV', 'Conversion', 'CA']],
        body: geoTable,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 9 },
        margin: { left: margin, right: margin }
      });

      yPosition = geoResult.finalY + 15;
    }

    // Personal Stats (only for closers)
    if (!isAdmin && user) {
      // Check if we need a new page
      if (yPosition > 200) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS PERSONNELLES', margin, yPosition);
      yPosition += 10;

      const personalStats = [
        ['Niveau', (user.level || 1).toString()],
        ['XP Total', (user.xp || 0).toString()],
        ['RDV Confirmés', detailedStats.confirmedAppointments.toString()],
        ['CA Personnel', `€${detailedStats.totalRevenue.toLocaleString()}`]
      ];

      if (user.badges && user.badges.length > 0) {
        personalStats.push(['Badges', user.badges.join(', ')]);
      }

      const personalResult = autoTable(doc, {
        startY: yPosition,
        head: [['Métrique', 'Valeur']],
        body: personalStats,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246], textColor: 255 },
        styles: { fontSize: 10 },
        margin: { left: margin, right: margin }
      });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth - margin, doc.internal.pageSize.height - 10, { align: 'right' });
    }

    // Save the PDF
    doc.save(`statistiques_rupagency_${format(new Date(), 'yyyy-MM-dd_HH-mm', { locale: fr })}.pdf`);
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50">
            {isAdmin ? 'Statistiques globales' : 'Mes statistiques'}
          </h1>
          <p className="text-dark-600 dark:text-dark-400 mt-1">
            {isAdmin 
              ? 'Analyse approfondie des performances de l\'équipe et tendances globales'
              : 'Analyse de vos performances personnelles et tendances'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-dark-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-dark-900 dark:text-cream-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">90 derniers jours</option>
            <option value="1y">12 derniers mois</option>
          </select>
          
          <Button variant="outline" onClick={exportToPDF}>
            <Download className="w-4 h-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics with Growth */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                Total Appels
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {detailedStats.totalCalls}
              </p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(detailedStats.callsGrowth)}
                <span className={`text-sm ml-1 ${getGrowthColor(detailedStats.callsGrowth)}`}>
                  {Math.abs(detailedStats.callsGrowth).toFixed(1)}%
                </span>
                <span className="text-xs text-dark-500 dark:text-dark-400 ml-1">vs période précédente</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                RDV Fixés
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {detailedStats.totalAppointments}
              </p>
              <div className="flex items-center mt-1">
                {getGrowthIcon(detailedStats.appointmentsGrowth)}
                <span className={`text-sm ml-1 ${getGrowthColor(detailedStats.appointmentsGrowth)}`}>
                  {Math.abs(detailedStats.appointmentsGrowth).toFixed(1)}%
                </span>
                <span className="text-xs text-dark-500 dark:text-dark-400 ml-1">vs période précédente</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                Taux de Conversion
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                {detailedStats.callToAppointmentRate.toFixed(1)}%
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                {detailedStats.completedCalls} appels terminés
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-600 dark:text-dark-400">
                CA Généré
              </p>
              <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                €{detailedStats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-dark-600 dark:text-dark-400 mt-1">
                {detailedStats.confirmedAppointments} RDV confirmés
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Time Series Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            {isAdmin ? 'Évolution globale des appels et RDV' : 'Évolution de mes appels et RDV'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="appointments" stroke="#10b981" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2" />
            {isAdmin ? 'Résultats globaux des appels' : 'Mes résultats d\'appels'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={callOutcomes}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="count"
              >
                {callOutcomes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {callOutcomes.map((item, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-dark-600 dark:text-dark-400">
                  {item.outcome} ({item.percentage.toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sector Analysis */}
              <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            {isAdmin ? 'Performance par secteur d\'activité' : 'Mes performances par secteur'}
          </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700">
                <th className="text-left py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Secteur</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Appels</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">RDV</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Conversion</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">CA</th>
              </tr>
            </thead>
            <tbody>
              {sectorAnalysis
                .sort((a, b) => b.revenue - a.revenue)
                .map((sector, index) => (
                  <tr key={sector.sector} className="border-b border-dark-100 dark:border-dark-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-dark-900 dark:text-cream-50">
                          {sector.sector}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-dark-600 dark:text-dark-400">
                      {sector.calls}
                    </td>
                    <td className="text-center py-3 px-4 text-dark-600 dark:text-dark-400">
                      {sector.appointments}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sector.conversion >= 20 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        sector.conversion >= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {sector.conversion.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">
                      €{sector.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

            {/* Geographic Analysis - Only for admins */}
      {isAdmin && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Performance géographique (Top 10)
          </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-dark-900 dark:text-cream-50 mb-3">
              Par ville
            </h4>
            <div className="space-y-3">
              {geographicAnalysis.slice(0, 5).map((city, index) => (
                <div key={city.city} className="flex items-center justify-between p-3 bg-cream-50 dark:bg-dark-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' : 'bg-primary-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-dark-900 dark:text-cream-50">{city.city}</p>
                      <p className="text-sm text-dark-600 dark:text-dark-400">
                        {city.calls} appels, {city.appointments} RDV
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-dark-900 dark:text-cream-50">
                      €{city.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-dark-600 dark:text-dark-400">
                      {city.conversion.toFixed(1)}% conversion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-md font-medium text-dark-900 dark:text-cream-50 mb-3">
              Répartition géographique
            </h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={geographicAnalysis.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="revenue"
                >
                  {geographicAnalysis.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
      )}

      {/* User Performance - Only for admins */}
      {isAdmin && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Performance des closers
          </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-200 dark:border-dark-700">
                <th className="text-left py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Closer</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Appels</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">RDV</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Conversion</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Durée moy.</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">CA</th>
                <th className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">Performance</th>
              </tr>
            </thead>
            <tbody>
              {userPerformance
                .sort((a, b) => b.revenue - a.revenue)
                .map((performer, index) => (
                  <tr key={performer.name} className="border-b border-dark-100 dark:border-dark-800">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' : 'bg-primary-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="ml-3 font-medium text-dark-900 dark:text-cream-50">
                          {performer.name}
                        </span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 text-dark-600 dark:text-dark-400">
                      {performer.calls}
                    </td>
                    <td className="text-center py-3 px-4 text-dark-600 dark:text-dark-400">
                      {performer.appointments}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        performer.conversion >= 20 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        performer.conversion >= 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {performer.conversion.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-dark-600 dark:text-dark-400">
                      {performer.avgCallDuration > 0 ? `${performer.avgCallDuration.toFixed(0)}min` : '-'}
                    </td>
                    <td className="text-center py-3 px-4 font-medium text-dark-900 dark:text-cream-50">
                      €{performer.revenue.toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center">
                        {performer.conversion >= 20 ? (
                          <Zap className="w-4 h-4 text-green-600" />
                        ) : performer.conversion >= 10 ? (
                          <Activity className="w-4 h-4 text-yellow-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {/* Personal Stats for Closers */}
      {!isAdmin && user && (
        <Card>
          <h3 className="text-lg font-semibold text-dark-900 dark:text-cream-50 mb-4 flex items-center">
            <UserCheck className="w-5 h-5 mr-2" />
            Mes informations personnelles
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-dark-600 dark:text-dark-400">Niveau</p>
                  <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                    {user.level || 1}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-dark-600 dark:text-dark-400">XP Total</p>
                  <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                    {user.xp || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-dark-600 dark:text-dark-400">RDV Confirmés</p>
                  <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                    {detailedStats.confirmedAppointments}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-cream-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-dark-600 dark:text-dark-400">CA Personnel</p>
                  <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
                    €{detailedStats.totalRevenue.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>
          </div>
          
          {user.badges && user.badges.length > 0 && (
            <div className="mt-6 pt-6 border-t border-dark-200 dark:border-dark-700">
              <h4 className="text-sm font-medium text-dark-900 dark:text-cream-50 mb-3">
                Mes badges
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.badges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-sm text-primary-700 dark:text-primary-300"
                  >
                    {getBadgeIcon(badge)}
                    <span className="ml-1">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
              {detailedStats.avgCallDuration.toFixed(0)}min
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Durée moyenne d'appel
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
              {detailedStats.appointmentToConfirmedRate.toFixed(1)}%
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              Taux de confirmation RDV
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
              {isAdmin ? (
                <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              ) : (
                <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              )}
            </div>
            <p className="text-2xl font-bold text-dark-900 dark:text-cream-50">
              {isAdmin ? allUsers.length : detailedStats.totalCalls}
            </p>
            <p className="text-sm text-dark-600 dark:text-dark-400">
              {isAdmin ? 'Closers actifs' : 'Total appels'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Stats; 