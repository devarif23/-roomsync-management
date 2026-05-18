import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Wallet, CreditCard, Receipt, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { expenses, members } = useAppContext();
  const { user, getRegisteredUsers } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const registeredUsers = useMemo(() => getRegisteredUsers(), [members]);

  // Calculate totals across all months
  const stats = useMemo(() => {
    let totalExpense = 0;
    let totalPaid = 0;
    
    Object.values(expenses).forEach(monthRecords => {
      monthRecords.forEach(record => {
        const recordTotal = (record.wifi || 0) + (record.electricity || 0) + (record.rent || 0) + (record.other || 0);
        totalExpense += recordTotal;
        totalPaid += (record.paid || 0);
      });
    });

    return {
      totalExpense,
      totalPaid,
      totalDue: totalExpense - totalPaid,
      membersCount: members.length
    };
  }, [expenses, members]);

  // Chart data
  const chartData = useMemo(() => {
    return Object.entries(expenses).map(([month, records]) => {
      let monthTotal = 0;
      let monthPaid = 0;
      records.forEach(r => {
        monthTotal += (r.wifi || 0) + (r.electricity || 0) + (r.rent || 0) + (r.other || 0);
        monthPaid += (r.paid || 0);
      });
      return {
        name: month,
        [t('total')]: monthTotal,
        [t('paid')]: monthPaid,
        [t('due')]: monthTotal - monthPaid
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [expenses, t]);

  // Recent payments
  const recentPayments = useMemo(() => {
    const payments = [];
    Object.entries(expenses).forEach(([month, records]) => {
      records.forEach(record => {
        const member = members.find(m => m.id === record.memberId);
        if (record.payments && record.payments.length > 0) {
          record.payments.forEach(p => {
            payments.push({
              id: `${record.id}-${p.date}-${p.amount}`,
              memberName: member?.name || t('member'),
              month,
              amount: p.amount,
              date: p.date
            });
          });
        }
      });
    });
    return payments.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  }, [expenses, members, t]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('dashboard')}</h2>
        <p className="text-muted-foreground">{t('overview')}</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('total_expenses')}</CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">৳ {stats.totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('all_time_expenses')}</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('total_paid')}</CardTitle>
            <CreditCard className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-emerald-600">৳ {stats.totalPaid.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <p className="text-xs text-muted-foreground">{t('total_collected')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('total_due')}</CardTitle>
            <Receipt className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-destructive">৳ {stats.totalDue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="h-3 w-3 text-destructive" />
              <p className="text-xs text-muted-foreground">{t('amount_pending')}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-violet-500/10 rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">{t('active_members')}</CardTitle>
            <Users className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold">{stats.membersCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('currently_in_room')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('expense_overview')}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[250px] sm:h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `৳${value}`} fontSize={12} />
                    <Tooltip formatter={(value) => [`৳ ${value}`, '']} />
                    <Legend />
                    <Bar dataKey={t('total')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t('paid')} fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {t('no_data_yet')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">{t('recent_activity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentPayments.length > 0 ? (
                recentPayments.map(payment => (
                  <div key={payment.id} className="flex items-center">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none truncate">{payment.memberName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{payment.month} • {payment.date}</p>
                    </div>
                    <div className="ml-2 font-medium text-emerald-500 whitespace-nowrap">+৳{payment.amount.toLocaleString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {t('no_recent_activity')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Members Section - Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              {t('active_members')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registeredUsers.length > 0 ? (
              <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {registeredUsers.map(au => (
                  <div key={au.id} className="flex items-center gap-3 rounded-lg border p-3 bg-card hover:bg-muted/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-600 font-bold">
                      {au.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{au.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{au.phone}</p>
                    </div>
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-6">
                {t('no_active_users')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
