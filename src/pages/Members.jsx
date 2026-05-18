import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Plus, Trash2, Edit, X, Check, UserPlus } from 'lucide-react';
import { Avatar } from '../components/ui/Avatar';

export default function Members() {
  const { members, addMember, updateMember, deleteMember } = useAppContext();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.role === 'admin';

  const [isAdding, setIsAdding] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '', joinDate: '' });
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const handleAdd = (e) => {
    e.preventDefault();
    if (newMember.name) {
      addMember(newMember);
      setNewMember({ name: '', email: '', phone: '', joinDate: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (member) => {
    setEditingId(member.id);
    setEditData({ name: member.name, email: member.email, phone: member.phone, joinDate: member.joinDate });
  };

  const handleSaveEdit = (id) => {
    updateMember(id, editData);
    setEditingId(null);
    setEditData({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('members')}</h2>
          <p className="text-muted-foreground">{t('manage_members')}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
            <UserPlus className="h-4 w-4" /> {t('add_member')}
          </Button>
        )}
      </div>

      {isAdding && isAdmin && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">{t('add_new_member')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                placeholder={t('full_name')}
                value={newMember.name}
                onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                required
              />
              <Input
                placeholder={t('email_address')}
                type="email"
                value={newMember.email}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
              />
              <Input
                placeholder={t('phone_number')}
                value={newMember.phone}
                onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
              />
              <Input
                type="date"
                value={newMember.joinDate}
                onChange={e => setNewMember({ ...newMember, joinDate: e.target.value })}
                required
              />
              <div className="col-span-full flex gap-2 justify-end mt-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>{t('cancel')}</Button>
                <Button type="submit">{t('save_member')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Mobile Card View */}
      <div className="block sm:hidden space-y-3">
        {members.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {t('no_members_yet')}
            </CardContent>
          </Card>
        ) : (
          members.map(member => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar alt={member.name} className="h-10 w-10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {editingId === member.id ? (
                      <div className="space-y-2">
                        <Input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder={t('full_name')} className="h-8" />
                        <Input value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} placeholder={t('email_address')} className="h-8" />
                        <Input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder={t('phone_number')} className="h-8" />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                          <Button size="sm" onClick={() => handleSaveEdit(member.id)}><Check className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                        <p className="text-xs text-muted-foreground">{member.phone}</p>
                        <p className="text-xs text-muted-foreground mt-1">{t('join_date')}: {member.joinDate}</p>
                        {isAdmin && (
                          <div className="flex gap-2 mt-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => handleEdit(member)}>
                              <Edit className="h-3 w-3 mr-1" /> {t('edit')}
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:bg-destructive/10" onClick={() => deleteMember(member.id)}>
                              <Trash2 className="h-3 w-3 mr-1" /> {t('delete')}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <Card className="hidden sm:block">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('member')}</TableHead>
                <TableHead>{t('contact_info')}</TableHead>
                <TableHead>{t('join_date')}</TableHead>
                {isAdmin && <TableHead className="text-right">{t('action')}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 4 : 3} className="text-center h-24 text-muted-foreground">
                    {t('no_members_yet')}
                  </TableCell>
                </TableRow>
              ) : (
                members.map(member => (
                  <TableRow key={member.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar alt={member.name} />
                      {editingId === member.id ? (
                        <Input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} className="h-8 w-40" />
                      ) : (
                        <span className="font-medium">{member.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === member.id ? (
                        <div className="space-y-1">
                          <Input value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} className="h-8" placeholder={t('email_address')} />
                          <Input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} className="h-8" placeholder={t('phone_number')} />
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div>{member.email}</div>
                          <div className="text-muted-foreground">{member.phone}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{member.joinDate}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          {editingId === member.id ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600" onClick={() => handleSaveEdit(member.id)}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(member)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteMember(member.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
