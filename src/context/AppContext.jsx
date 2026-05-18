import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [notifications, setNotifications] = useState([]);
  const isLoaded = useRef(false);

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const storedMembers = JSON.parse(localStorage.getItem('room_members') || '[]');

    // Make sure every user in users (including Admin) is in room_members
    allUsers.forEach(u => {
      if (!storedMembers.some(m => m.phone === u.phone || m.id === u.id)) {
        storedMembers.push({
          id: u.id,
          name: u.name,
          email: u.email || '',
          phone: u.phone,
          joinDate: u.joinDate || new Date().toISOString().split('T')[0]
        });
      }
    });

    localStorage.setItem('room_members', JSON.stringify(storedMembers));
    setMembers(storedMembers);

    const storedExpenses = JSON.parse(localStorage.getItem('room_expenses') || '{}');
    setExpenses(storedExpenses);
  }, []);

  // Listen for member updates from registration or admin actions
  useEffect(() => {
    const handleMembersUpdated = () => {
      const storedMembers = localStorage.getItem('room_members');
      if (storedMembers) setMembers(JSON.parse(storedMembers));
    };
    window.addEventListener('members-updated', handleMembersUpdated);
    return () => window.removeEventListener('members-updated', handleMembersUpdated);
  }, []);

  // Listen for expense updates from admin actions
  useEffect(() => {
    const handleExpensesUpdated = () => {
      const storedExpenses = localStorage.getItem('room_expenses');
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    };
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    return () => window.removeEventListener('expenses-updated', handleExpensesUpdated);
  }, []);

  const addMember = (member) => {
    const newMember = { ...member, id: Date.now() };
    setMembers(prev => {
      const updated = [...prev, newMember];
      localStorage.setItem('room_members', JSON.stringify(updated));
      return updated;
    });
  };

  const updateMember = (id, data) => {
    setMembers(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...data } : m);
      localStorage.setItem('room_members', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteMember = (id) => {
    setMembers(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem('room_members', JSON.stringify(updated));
      return updated;
    });
    setExpenses(prev => {
      const updated = {};
      Object.entries(prev).forEach(([month, records]) => {
        updated[month] = records.filter(r => r.memberId !== id);
      });
      localStorage.setItem('room_expenses', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteUserExpenses = (userId) => {
    setExpenses(prev => {
      const updated = {};
      Object.entries(prev).forEach(([month, records]) => {
        updated[month] = records.filter(r => r.memberId !== userId);
      });
      localStorage.setItem('room_expenses', JSON.stringify(updated));
      return updated;
    });
  };

  const addExpenseRecord = (month, record) => {
    setExpenses(prev => {
      const monthData = prev[month] || [];
      const updated = {
        ...prev,
        [month]: [...monthData, { ...record, id: Date.now(), paid: 0, payments: [] }]
      };
      localStorage.setItem('room_expenses', JSON.stringify(updated));
      return updated;
    });
  };

  const updateExpenseRecord = (month, id, data) => {
    setExpenses(prev => {
      const monthData = prev[month] || [];
      const updated = {
        ...prev,
        [month]: monthData.map(r => r.id === id ? { ...r, ...data } : r)
      };
      localStorage.setItem('room_expenses', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteExpenseRecord = (month, id) => {
    setExpenses(prev => {
      const monthData = prev[month] || [];
      const updated = {
        ...prev,
        [month]: monthData.filter(r => r.id !== id)
      };
      localStorage.setItem('room_expenses', JSON.stringify(updated));
      return updated;
    });
  };

  const addPayment = (month, expenseId, amount) => {
    setExpenses(prev => {
      const monthData = prev[month] || [];
      const expenseIndex = monthData.findIndex(r => r.id === expenseId);
      if (expenseIndex === -1) return prev;

      const expense = monthData[expenseIndex];
      const newPayment = { date: new Date().toISOString().split('T')[0], amount: Number(amount) };
      const updatedExpense = {
        ...expense,
        paid: (expense.paid || 0) + Number(amount),
        payments: [...(expense.payments || []), newPayment]
      };

      const newMonthData = [...monthData];
      newMonthData[expenseIndex] = updatedExpense;

      const updated = { ...prev, [month]: newMonthData };
      localStorage.setItem('room_expenses', JSON.stringify(updated));

      // Show notification after updating state
      setTimeout(() => {
        const member = members.find(m => m.id === expense.memberId);
        const memberName = member ? member.name : 'Member';
        showNotification(`Payment of ৳${amount} recorded for ${memberName}. SMS/Email confirmation sent.`);
      }, 50);

      return updated;
    });
  };

  const showNotification = (message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <AppContext.Provider value={{
      members, addMember, updateMember, deleteMember, deleteUserExpenses,
      expenses, addExpenseRecord, updateExpenseRecord, deleteExpenseRecord, addPayment,
      notifications, removeNotification, showNotification
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
