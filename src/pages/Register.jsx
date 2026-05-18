import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertCircle, CheckCircle2, Home } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password.length < 6) {
      setError(t('password_min_length') || 'Password must be at least 6 characters long');
      return;
    }

    const res = register(formData);
    if (!res.success) {
      setError(res.message);
    } else {
      setSuccess(t('registration_success') || 'Registration successful! You can now log in.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 backdrop-blur-sm">
        <CardHeader className="space-y-1 items-center">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mb-2 shadow-lg">
            <Home className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl text-center">{t('create_account')}</CardTitle>
          <CardDescription className="text-center">
            {t('sign_up_desc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/15 text-destructive px-3 py-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-500/15 text-emerald-600 px-3 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">{t('full_name')}</label>
              <Input 
                id="name" 
                type="text" 
                placeholder={t('full_name')}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">{t('email_address')}</label>
              <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">{t('phone_number')}</label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="01XXXXXXXXX" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">{t('password')}</label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!!success}>
              {t('register')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t pt-4 text-sm text-center">
          <p className="text-muted-foreground">
            {t('already_have_account')} <Link to="/login" className="text-primary hover:underline font-medium">{t('sign_in')}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
