import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Plus, Banknote, Trash2, Edit, X, Check } from 'lucide-react';

export default function Expenses() {
  const { expenses, members, addPayment, addExpenseRecord, updateExpenseRecord, deleteExpenseRecord } = useAppContext();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const months = Object.keys(expenses).sort((a, b) => b.localeCompare(a));
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(months[0] || currentMonth);
  
  const [paymentData, setPaymentData] = useState({ expenseId: null, amount: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newExpense, setNewExpense] = useState({ memberId: '', wifi: '', electricity: '', rent: '', other: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newMonth, setNewMonth] = useState('');
  const [showNewMonth, setShowNewMonth] = useState(false);

  const currentRecords = expenses[selectedMonth] || [];

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (paymentData.expenseId && paymentData.amount) {
      addPayment(selectedMonth, paymentData.expenseId, paymentData.amount);
      setPaymentData({ expenseId: null, amount: '' });
    }
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (newExpense.memberId) {
      addExpenseRecord(selectedMonth, {
        memberId: Number(newExpense.memberId),
        wifi: Number(newExpense.wifi) || 0,
        electricity: Number(newExpense.electricity) || 0,
        rent: Number(newExpense.rent) || 0,
        other: Number(newExpense.other) || 0
      });
      setNewExpense({ memberId: '', wifi: '', electricity: '', rent: '', other: '' });
      setShowAddForm(false);
    }
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    setEditData({
      wifi: record.wifi || 0,
      electricity: record.electricity || 0,
      rent: record.rent || 0,
      other: record.other || 0
    });
  };

  const handleSaveEdit = (id) => {
    updateExpenseRecord(selectedMonth, id, {
      wifi: Number(editData.wifi) || 0,
      electricity: Number(editData.electricity) || 0,
      rent: Number(editData.rent) || 0,
      other: Number(editData.other) || 0
    });
    setEditingId(null);
    setEditData({});
  };

  const handleCreateMonth = () => {
    if (newMonth && !expenses[newMonth]) {
      // Just set the selected month, records will be created when expenses are added
      setSelectedMonth(newMonth);
      setShowNewMonth(false);
      setNewMonth('');
    }
  };

  // All available months including selected
  const allMonths = [...new Set([...months, selectedMonth])].sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('monthly_expenses')}</h2>
          <p className="text-muted-foreground">{t('track_bills')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select 
            className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background w-full sm:w-[200px]"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {allMonths.map(m => (
              <option key={m} value={m}>{new Date(m + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
            ))}
          </select>
          {isAdmin && (
            <div className="flex gap-2">
              <Button onClick={() => setShowNewMonth(!showNewMonth)} variant="outline" className="gap-2" size="sm">
                <Plus className="h-4 w-4" /> {t('new_month')}
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2" size="sm">
                <Plus className="h-4 w-4" /> {t('add_expense')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* New Month Creation */}
      {showNewMonth && isAdmin && (
        <Card className="border-blue-500/50 bg-blue-500/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium">{t('select_month')}</label>
                <Input 
                  type="month" 
                  value={newMonth}
                  onChange={(e) => setNewMonth(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowNewMonth(false)}>{t('cancel')}</Button>
                <Button onClick={handleCreateMonth}>{t('create')}</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Expense Form */}
      {showAddForm && isAdmin && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">{t('add_expense')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs font-medium">{t('member')}</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newExpense.memberId}
                  onChange={(e) => setNewExpense({ ...newExpense, memberId: e.target.value })}
                  required
                >
                  <option value="">{t('select_member')}</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t('wifi')}</label>
                <Input type="number" min="0" value={newExpense.wifi} onChange={(e) => setNewExpense({ ...newExpense, wifi: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t('electricity')}</label>
                <Input type="number" min="0" value={newExpense.electricity} onChange={(e) => setNewExpense({ ...newExpense, electricity: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t('rent')}</label>
                <Input type="number" min="0" value={newExpense.rent} onChange={(e) => setNewExpense({ ...newExpense, rent: e.target.value })} placeholder="0" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{t('other')}</label>
                <Input type="number" min="0" value={newExpense.other} onChange={(e) => setNewExpense({ ...newExpense, other: e.target.value })} placeholder="0" />
              </div>
              <div className="col-span-full flex gap-2 justify-end mt-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>{t('cancel')}</Button>
                <Button type="submit">{t('save')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Payment Form */}
      {paymentData.expenseId && isAdmin && (
        <Card className="border-emerald-500/50 bg-emerald-500/5">
          <CardContent className="p-4">
            <form onSubmit={handleAddPayment} className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 space-y-2 w-full">
                <label className="text-sm font-medium">{t('payment_amount')} (৳)</label>
                <Input 
                  type="number" 
                  min="1"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                  placeholder={t('enter_amount')}
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setPaymentData({ expenseId: null, amount: '' })}>{t('cancel')}</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">{t('record_payment')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('member')}</TableHead>
                <TableHead className="text-right">{t('wifi')}</TableHead>
                <TableHead className="text-right">{t('electricity')}</TableHead>
                <TableHead className="text-right">{t('rent')}</TableHead>
                <TableHead className="text-right">{t('other')}</TableHead>
                <TableHead className="text-right font-bold">{t('total')}</TableHead>
                <TableHead className="text-right">{t('paid')}</TableHead>
                <TableHead className="text-right">{t('due')}</TableHead>
                <TableHead className="text-center">{t('status')}</TableHead>
                {isAdmin && <TableHead className="text-center">{t('action')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 10 : 9} className="text-center h-24 text-muted-foreground">
                    {t('no_records')}
                  </TableCell>
                </TableRow>
              ) : (
                currentRecords.map(record => {
                  const member = members.find(m => m.id === record.memberId);
                  const isEditing = editingId === record.id;
                  const wifi = isEditing ? Number(editData.wifi) || 0 : (record.wifi || 0);
                  const elec = isEditing ? Number(editData.electricity) || 0 : (record.electricity || 0);
                  const rent = isEditing ? Number(editData.rent) || 0 : (record.rent || 0);
                  const other = isEditing ? Number(editData.other) || 0 : (record.other || 0);
                  const total = wifi + elec + rent + other;
                  const due = total - (record.paid || 0);
                  
                  let status = 'due';
                  if (due <= 0) status = 'paid';
                  else if (record.paid > 0) status = 'partial';

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium whitespace-nowrap">{member?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input type="number" className="w-20 h-8 text-right ml-auto" value={editData.wifi} onChange={(e) => setEditData({...editData, wifi: e.target.value})} />
                        ) : `৳${record.wifi}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input type="number" className="w-20 h-8 text-right ml-auto" value={editData.electricity} onChange={(e) => setEditData({...editData, electricity: e.target.value})} />
                        ) : `৳${record.electricity}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input type="number" className="w-20 h-8 text-right ml-auto" value={editData.rent} onChange={(e) => setEditData({...editData, rent: e.target.value})} />
                        ) : `৳${record.rent}`}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? (
                          <Input type="number" className="w-20 h-8 text-right ml-auto" value={editData.other} onChange={(e) => setEditData({...editData, other: e.target.value})} />
                        ) : `৳${record.other}`}
                      </TableCell>
                      <TableCell className="text-right font-bold">৳{total}</TableCell>
                      <TableCell className="text-right text-emerald-600">৳{record.paid}</TableCell>
                      <TableCell className="text-right text-destructive font-medium">৳{due > 0 ? due : 0}</TableCell>
                      <TableCell className="text-center">
                        {status === 'paid' && <Badge variant="success">{t('paid')}</Badge>}
                        {status === 'partial' && <Badge variant="warning">{t('partial')}</Badge>}
                        {status === 'due' && <Badge variant="destructive">{t('due')}</Badge>}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleSaveEdit(record.id)}>
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(record)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 gap-1"
                                  onClick={() => setPaymentData({ expenseId: record.id, amount: due > 0 ? due.toString() : '' })}
                                  disabled={due <= 0}
                                >
                                  <Banknote className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => deleteExpenseRecord(selectedMonth, record.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
