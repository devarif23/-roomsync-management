import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  ShieldCheck, Users, Receipt, BarChart3,
  Plus, Trash2, Edit, X, Check, Download,
  Wifi, Zap, Home, Package, UserPlus, Eye, EyeOff
} from 'lucide-react';

const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'bills', label: 'Bills', icon: Receipt },
];

export default function AdminPanel() {
  const { getAllUsers, adminAddUser, adminUpdateUser, adminDeleteUser } = useAuth();
  const { members, expenses, addExpenseRecord, updateExpenseRecord, deleteExpenseRecord } = useAppContext();

  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);

  // Users tab state
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPass, setShowPass] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', phone: '', email: '', password: '123456', role: 'user' });
  const [editData, setEditData] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Bills tab state
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [billMonth, setBillMonth] = useState(currentMonth);
  const [showBillForm, setShowBillForm] = useState(false);
  const [billForm, setBillForm] = useState({ memberId: '', wifi: '', electricity: '', rent: '', other: '' });
  const [editBillId, setEditBillId] = useState(null);
  const [editBillData, setEditBillData] = useState({});

  const refreshUsers = () => setUsers(getAllUsers());

  useEffect(() => { refreshUsers(); }, [members]);

  // ── Overview stats ──────────────────────────────────────────────
  const stats = (() => {
    let totalExp = 0, totalPaid = 0, totalWifi = 0, totalElec = 0, totalRent = 0;
    Object.values(expenses).forEach(recs => recs.forEach(r => {
      totalExp += (r.wifi || 0) + (r.electricity || 0) + (r.rent || 0) + (r.other || 0);
      totalPaid += r.paid || 0;
      totalWifi += r.wifi || 0;
      totalElec += r.electricity || 0;
      totalRent += r.rent || 0;
    }));
    return { totalExp, totalPaid, due: totalExp - totalPaid, totalWifi, totalElec, totalRent, userCount: users.filter(u => u.role !== 'admin').length };
  })();

  // ── User handlers ───────────────────────────────────────────────
  const handleAddUser = (e) => {
    e.preventDefault();
    const res = adminAddUser(newUser);
    if (res.success) { setNewUser({ name: '', phone: '', email: '', password: '123456', role: 'user' }); setShowAddUser(false); refreshUsers(); }
    else alert(res.message);
  };

  const handleSaveEdit = (id) => {
    adminUpdateUser(id, editData);
    setEditingUserId(null);
    setEditData({});
    refreshUsers();
  };

  const handleDelete = (id) => {
    adminDeleteUser(id);
    setConfirmDelete(null);
    refreshUsers();
  };

  // ── Bill handlers ───────────────────────────────────────────────
  const currentBills = expenses[billMonth] || [];

  const handleAddBill = (e) => {
    e.preventDefault();
    if (!billForm.memberId) return;
    addExpenseRecord(billMonth, {
      memberId: Number(billForm.memberId),
      wifi: Number(billForm.wifi) || 0,
      electricity: Number(billForm.electricity) || 0,
      rent: Number(billForm.rent) || 0,
      other: Number(billForm.other) || 0,
    });
    setBillForm({ memberId: '', wifi: '', electricity: '', rent: '', other: '' });
    setShowBillForm(false);
  };

  const handleSaveBill = (id) => {
    updateExpenseRecord(billMonth, id, {
      wifi: Number(editBillData.wifi) || 0,
      electricity: Number(editBillData.electricity) || 0,
      rent: Number(editBillData.rent) || 0,
      other: Number(editBillData.other) || 0,
    });
    setEditBillId(null);
  };

  // ── CSV download ─────────────────────────────────────────────────
  const downloadBillsCSV = () => {
    const rows = [['Month', 'Member', 'WiFi', 'Electricity', 'Rent', 'Other', 'Total', 'Paid', 'Due', 'Status']];
    Object.entries(expenses).forEach(([month, recs]) => {
      recs.forEach(r => {
        const mem = members.find(m => m.id === r.memberId);
        const total = (r.wifi || 0) + (r.electricity || 0) + (r.rent || 0) + (r.other || 0);
        const due = total - (r.paid || 0);
        const status = due <= 0 ? 'Paid' : r.paid > 0 ? 'Partial' : 'Due';
        rows.push([month, mem?.name || 'Unknown', r.wifi || 0, r.electricity || 0, r.rent || 0, r.other || 0, total, r.paid || 0, Math.max(due, 0), status]);
      });
    });
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'roomsync_bills.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Panel</h2>
            <p className="text-muted-foreground text-sm">Manage users, bills & data</p>
          </div>
        </div>
        <Button onClick={downloadBillsCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export All Bills CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Icon className="h-4 w-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Total Users', value: stats.userCount, color: 'violet', icon: Users },
              { label: 'Total Billed', value: `৳${stats.totalExp.toLocaleString()}`, color: 'blue', icon: Receipt },
              { label: 'Total Collected', value: `৳${stats.totalPaid.toLocaleString()}`, color: 'emerald', icon: Check },
              { label: 'Total Due', value: `৳${stats.due.toLocaleString()}`, color: 'red', icon: X },
            ].map(card => {
              const Icon = card.icon;
              return (
                <Card key={card.label} className="relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-${card.color}-500/10 rounded-bl-full`} />
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium">{card.label}</CardTitle>
                    <Icon className={`h-4 w-4 text-${card.color}-500`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold">{card.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {[
              { label: 'WiFi Bills', value: stats.totalWifi, icon: Wifi, color: 'sky' },
              { label: 'Electricity Bills', value: stats.totalElec, icon: Zap, color: 'yellow' },
              { label: 'Room Rent', value: stats.totalRent, icon: Home, color: 'green' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <Card key={item.label}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg bg-${item.color}-500/10 flex items-center justify-center shrink-0`}>
                      <Icon className={`h-5 w-5 text-${item.color}-500`} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="text-xl font-bold">৳{item.value.toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── USERS TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddUser(!showAddUser)} className="gap-2">
              <UserPlus className="h-4 w-4" /> Add User
            </Button>
          </div>

          {/* Add User Form */}
          {showAddUser && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader><CardTitle className="text-base">Add New User</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Input placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} required />
                  <Input placeholder="Phone Number" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} required />
                  <Input placeholder="Email Address" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                  <div className="relative">
                    <Input placeholder="Password" type={showPass ? 'text' : 'password'} value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} required />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="flex gap-2 items-end">
                    <Button type="button" variant="outline" onClick={() => setShowAddUser(false)}>Cancel</Button>
                    <Button type="submit">Save User</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Users Table */}
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    <th className="text-left p-3 font-medium">User</th>
                    <th className="text-left p-3 font-medium">Phone</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Role</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          {editingUserId === u.id ? (
                            <Input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} className="h-7 w-28" />
                          ) : (
                            <span className="font-medium">{u.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        {editingUserId === u.id ? (
                          <Input value={editData.phone || ''} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="h-7 w-32" />
                        ) : u.phone}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {editingUserId === u.id ? (
                          <Input value={editData.email || ''} onChange={e => setEditData({ ...editData, email: e.target.value })} className="h-7 w-36" />
                        ) : u.email}
                      </td>
                      <td className="p-3">
                        {editingUserId === u.id ? (
                          <select className="h-7 rounded-md border border-input bg-background px-2 text-xs" value={editData.role || u.role} onChange={e => setEditData({ ...editData, role: e.target.value })}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-violet-500/20 text-violet-500' : 'bg-blue-500/20 text-blue-500'}`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-end gap-1">
                          {editingUserId === u.id ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => handleSaveEdit(u.id)}><Check className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingUserId(null)}><X className="h-3.5 w-3.5" /></Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingUserId(u.id); setEditData({ name: u.name, phone: u.phone, email: u.email, role: u.role }); }}>
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              {u.role !== 'admin' && (
                                confirmDelete === u.id ? (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-destructive">Sure?</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(u.id)}><Check className="h-3.5 w-3.5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setConfirmDelete(null)}><X className="h-3.5 w-3.5" /></Button>
                                  </div>
                                ) : (
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setConfirmDelete(u.id)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                )
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No users found</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── BILLS TAB ── */}
      {activeTab === 'bills' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Month:</label>
              <Input type="month" value={billMonth} onChange={e => setBillMonth(e.target.value)} className="w-44 h-9" />
            </div>
            <Button onClick={() => setShowBillForm(!showBillForm)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Bill Entry
            </Button>
          </div>

          {/* Add Bill Form */}
          {showBillForm && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader><CardTitle className="text-base">Add Bill for {new Date(billMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddBill} className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                  <div className="space-y-1 col-span-2 sm:col-span-3 lg:col-span-2">
                    <label className="text-xs font-medium">Member</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={billForm.memberId} onChange={e => setBillForm({ ...billForm, memberId: e.target.value })} required>
                      <option value="">Select Member</option>
                      {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </select>
                  </div>
                  {[
                    { key: 'wifi', label: 'WiFi', icon: '📶' },
                    { key: 'electricity', label: 'Electricity', icon: '⚡' },
                    { key: 'rent', label: 'Room Rent', icon: '🏠' },
                    { key: 'other', label: 'Other', icon: '📦' },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-xs font-medium">{f.icon} {f.label}</label>
                      <Input type="number" min="0" placeholder="0" value={billForm[f.key]} onChange={e => setBillForm({ ...billForm, [f.key]: e.target.value })} />
                    </div>
                  ))}
                  <div className="col-span-full flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => setShowBillForm(false)}>Cancel</Button>
                    <Button type="submit">Save Bill</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Bills Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Bills — {new Date(billMonth + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/30">
                  <tr>
                    {['Member', 'WiFi', 'Electricity', 'Rent', 'Other', 'Total', 'Paid', 'Due', 'Status', 'Actions'].map(h => (
                      <th key={h} className="p-3 text-left font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentBills.length === 0 ? (
                    <tr><td colSpan={10} className="py-12 text-center text-muted-foreground">No bill records for this month</td></tr>
                  ) : currentBills.map(r => {
                    const mem = members.find(m => m.id === r.memberId);
                    const isEdit = editBillId === r.id;
                    const wifi = isEdit ? Number(editBillData.wifi) || 0 : (r.wifi || 0);
                    const elec = isEdit ? Number(editBillData.electricity) || 0 : (r.electricity || 0);
                    const rent = isEdit ? Number(editBillData.rent) || 0 : (r.rent || 0);
                    const other = isEdit ? Number(editBillData.other) || 0 : (r.other || 0);
                    const total = wifi + elec + rent + other;
                    const due = total - (r.paid || 0);
                    const status = due <= 0 ? 'Paid' : r.paid > 0 ? 'Partial' : 'Due';
                    const statusCls = { Paid: 'bg-emerald-500/20 text-emerald-500', Partial: 'bg-yellow-500/20 text-yellow-600', Due: 'bg-red-500/20 text-red-500' };

                    return (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium whitespace-nowrap">{mem?.name || 'Unknown'}</td>
                        {isEdit ? (
                          <>
                            {['wifi', 'electricity', 'rent', 'other'].map(f => (
                              <td key={f} className="p-3">
                                <Input type="number" className="h-7 w-20 text-right" value={editBillData[f]} onChange={e => setEditBillData({ ...editBillData, [f]: e.target.value })} />
                              </td>
                            ))}
                          </>
                        ) : (
                          <>
                            <td className="p-3">৳{r.wifi || 0}</td>
                            <td className="p-3">৳{r.electricity || 0}</td>
                            <td className="p-3">৳{r.rent || 0}</td>
                            <td className="p-3">৳{r.other || 0}</td>
                          </>
                        )}
                        <td className="p-3 font-bold">৳{total}</td>
                        <td className="p-3 text-emerald-600 font-medium">৳{r.paid || 0}</td>
                        <td className="p-3 text-destructive font-medium">৳{Math.max(due, 0)}</td>
                        <td className="p-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusCls[status]}`}>{status}</span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            {isEdit ? (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600" onClick={() => handleSaveBill(r.id)}><Check className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditBillId(null)}><X className="h-3.5 w-3.5" /></Button>
                              </>
                            ) : (
                              <>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditBillId(r.id); setEditBillData({ wifi: r.wifi || 0, electricity: r.electricity || 0, rent: r.rent || 0, other: r.other || 0 }); }}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => deleteExpenseRecord(billMonth, r.id)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
