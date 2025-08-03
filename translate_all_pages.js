// Script pour traduire toutes les pages de l'application
// Ce script liste toutes les pages qui doivent être traduites

const pagesToTranslate = [
  'src/pages/AddCompany.jsx',
  'src/pages/CallForm.jsx', 
  'src/pages/Calls.jsx',
  'src/pages/CallExecute.jsx',
  'src/pages/Appointments.jsx',
  'src/pages/AppointmentDetail.jsx',
  'src/pages/AddAppointment.jsx',
  'src/pages/Stats.jsx',
  'src/pages/AddUser.jsx',
  'src/pages/EditUser.jsx',
  'src/pages/UserDetail.jsx',
  'src/pages/Login.jsx'
];

console.log('Pages à traduire :', pagesToTranslate);

// Instructions pour chaque page :
// 1. Ajouter l'import : import { useLanguage } from '../contexts/LanguageContext';
// 2. Ajouter const { t } = useLanguage(); dans le composant
// 3. Remplacer tous les textes par t('key')
// 4. Ajouter les nouvelles clés dans les fichiers de traduction (fr.js, en.js, id.js) 