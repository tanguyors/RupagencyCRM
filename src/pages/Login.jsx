import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import useStore from '../store/useStore';
import { useLanguage } from '../contexts/LanguageContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useStore(state => state.login);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success(`${t('welcome')} ${useStore.getState().user?.name} !`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || t('loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-cream-100 dark:from-dark-900 dark:to-dark-800 p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-dark-900 dark:text-cream-50 mb-2">
              Rupagency
            </h1>
            <p className="text-dark-600 dark:text-dark-400">
              {t('crmForClosers')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label={t('email')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                icon={<Mail className="w-4 h-4" />}
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label={t('password')}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  icon={<Lock className="w-4 h-4" />}
                />
                <button
                  type="button"
                  className="absolute right-3 top-8 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? t('connecting') : t('login')}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <p className="text-sm text-primary-700 dark:text-primary-300 mb-2">
              <strong>Comptes de démonstration :</strong>
            </p>
            <div className="text-xs text-primary-600 dark:text-primary-400 space-y-1">
              <p>• Closer: thomas@rupagency.com / password123</p>
              <p>• Admin: admin@rupagency.com / password123</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login; 