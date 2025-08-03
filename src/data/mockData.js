export const mockUsers = [
  {
    id: 1,
    name: "Thomas Martin",
    email: "thomas@rupagency.com",
    phone: "+33 6 12 34 56 78",
    role: "closer",
    status: "active",
    avatar: "TM",
    xp: 1250,
    level: 8,
    badges: ["Top Performer", "Early Bird"],
    stats: {
      totalCalls: 156,
      totalAppointments: 23,
      conversionRate: 14.7,
      totalRevenue: 45600,
    }
  },
  {
    id: 2,
    name: "Sophie Dubois",
    email: "sophie@rupagency.com",
    phone: "+33 6 98 76 54 32",
    role: "closer",
    status: "active",
    avatar: "SD",
    xp: 890,
    level: 6,
    badges: ["Consistent", "Team Player"],
    stats: {
      totalCalls: 134,
      totalAppointments: 18,
      conversionRate: 13.4,
      totalRevenue: 34200,
    }
  },
  {
    id: 3,
    name: "Admin Rupagency",
    email: "admin@rupagency.com",
    phone: "+33 6 11 22 33 44",
    role: "admin",
    status: "active",
    avatar: "AR",
    xp: 2500,
    level: 15,
    badges: ["Manager", "Founder"],
  }
];

export const mockCompanies = [
  {
    id: 1,
    name: "TechSolutions SARL",
    phone: "01 42 34 56 78",
    city: "Paris",
    postalCode: "75001",
    country: "France",
    siren: "123456789",
    manager: "Jean Dupont",
    sector: "Technologie",
    email: "contact@techsolutions.fr",
    website: "www.techsolutions.fr",
    size: "10-50",
    notes: "Intéressé par nos solutions de prospection",
    status: "Prospect",
    assignedTo: 1,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    name: "Marketing Pro",
    phone: "04 78 12 34 56",
    city: "Lyon",
    postalCode: "69001",
    country: "France",
    siren: "987654321",
    manager: "Marie Laurent",
    sector: "Marketing",
    email: "info@marketingpro.fr",
    website: "www.marketingpro.fr",
    size: "5-10",
    notes: "Besoin de développement commercial",
    status: "Lead",
    assignedTo: 2,
    createdAt: "2024-01-14T14:20:00Z"
  },
  {
    id: 3,
    name: "Consulting Plus",
    phone: "05 61 23 45 67",
    city: "Toulouse",
    postalCode: "31000",
    country: "France",
    siren: "456789123",
    manager: "Pierre Moreau",
    sector: "Conseil",
    email: "contact@consultingplus.fr",
    website: "www.consultingplus.fr",
    size: "50-100",
    notes: "Grand potentiel, à relancer",
    status: "Prospect",
    assignedTo: 1,
    createdAt: "2024-01-13T09:15:00Z"
  }
];

export const mockCalls = [
  {
    id: 1,
    companyId: 1,
    type: "Prospection",
    scheduledDateTime: "2024-01-22T14:00:00",
    notes: "Présenter nos solutions de prospection. Focus sur ROI et résultats.",
    priority: "Haute",
    status: "Programmé",
    createdAt: "2024-01-15T11:00:00Z",
    userId: 1
  },
  {
    id: 2,
    companyId: 2,
    type: "Prospection",
    scheduledDateTime: "2024-01-23T10:30:00",
    notes: "Relance après premier contact. Vérifier disponibilité pour démo.",
    priority: "Normal",
    status: "Programmé",
    createdAt: "2024-01-14T15:30:00Z",
    userId: 2
  },
  {
    id: 3,
    companyId: 3,
    type: "Contrôle qualité",
    scheduledDateTime: "2024-01-24T15:00:00",
    notes: "Suivi client après mise en place. Vérifier satisfaction.",
    priority: "Basse",
    status: "Programmé",
    createdAt: "2024-01-13T10:45:00Z",
    userId: 1
  }
];

export const mockAppointments = [
  {
    id: 1,
    companyId: 1,
    date: "2024-01-22T14:00:00",
    briefing: "Présentation complète de nos solutions de prospection. Focus sur ROI et résultats.",
    status: "Confirmé",
    createdAt: "2024-01-15T11:05:00Z",
    userId: 1
  },
  {
    id: 2,
    companyId: 2,
    date: "2024-01-23T10:30:00",
    briefing: "Démo produit et discussion sur les besoins spécifiques.",
    status: "En attente",
    createdAt: "2024-01-14T15:35:00Z",
    userId: 2
  },
  {
    id: 3,
    companyId: 3,
    date: "2024-01-24T15:00:00",
    briefing: "Réunion de suivi et présentation des nouvelles fonctionnalités.",
    status: "Confirmé",
    createdAt: "2024-01-13T10:45:00Z",
    userId: 1
  }
];

export const mockStats = {
  totalCalls: 290,
  totalAppointments: 41,
  conversionRate: 14.1,
  totalRevenue: 79800,
  monthlyGrowth: 12.5,
  topPerformers: [
    { name: "Thomas Martin", appointments: 23, revenue: 45600 },
    { name: "Sophie Dubois", appointments: 18, revenue: 34200 }
  ]
}; 