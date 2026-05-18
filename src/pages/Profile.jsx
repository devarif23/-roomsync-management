import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { CheckCircle2, Mail, Shield, User, Camera, Phone } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showNotification } = useAppContext();
  const { t } = useLanguage();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification("File is too large. Please select an image under 2MB.");
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const res = updateProfile({ avatar: base64String });
        if (res.success) {
          showNotification("Profile picture updated successfully!");
        } else {
          showNotification("Failed to update profile picture.");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('profile')}</h2>
        <p className="text-muted-foreground">{t('manage_account')}</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('personal_info')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
            <div className="relative group shrink-0">
              <Avatar src={user?.avatar} alt={user?.name} className="h-24 w-24 text-2xl" />
              {user?.verified && (
                <div className="absolute bottom-0 right-0 bg-background rounded-full p-0.5 z-10">
                  <CheckCircle2 className="h-6 w-6 text-blue-500" />
                </div>
              )}
              
              {/* Upload Overlay */}
              <div 
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-6 w-6" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="space-y-4 text-center sm:text-left flex-1 w-full">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold flex items-center justify-center sm:justify-start gap-2">
                  {user?.name}
                </h3>
                <div className="flex flex-col gap-1 mt-2 text-muted-foreground">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{user?.phone}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2 border-t">
                <div className="flex items-center gap-1.5 text-sm">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="font-medium capitalize">{user?.role} {t('access')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm ml-4">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    {t('status')}: <Badge variant={user?.verified ? "success" : "secondary"}>{user?.verified ? t('verified') : t('unverified')}</Badge>
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('account_details')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              {t('profile_pic_desc')}
            </p>
            <p>
              {t('logs_in_using')} <strong>{user?.phone}</strong>
            </p>
            <p>
              {user?.role === 'admin' ? t('role_desc_admin') : t('role_desc_user')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
