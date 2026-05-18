import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AlertCircle, Home } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const res = login(phone, password);
    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-primary/20 backdrop-blur-sm">
        <CardHeader className="space-y-1 items-center">
          <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-3xl mb-2 shadow-lg">
            <Home className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl text-center">{t('welcome_back')}</CardTitle>
          <CardDescription className="text-center">
            {t('enter_phone')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/15 text-destructive px-3 py-2 text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="phone">{t('phone_number')}</label>
              <Input 
                id="phone" 
                type="tel" 
                placeholder="01XXXXXXXXX" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor="password">{t('password')}</label>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              {t('sign_in')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t pt-4 text-sm text-center">
          <p className="text-muted-foreground">
            {t('no_account')} <Link to="/register" className="text-primary hover:underline font-medium">{t('register_here')}</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
