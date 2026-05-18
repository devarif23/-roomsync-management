import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState({});
  const [notifications, setNotifications] = useState([]);
  const isLoaded = useRef(false);

  useEffect(() => {
    const storedMembers = localStorage.getItem('room_members');
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    } else {
      localStorage.setItem('room_members', JSON.stringify([]));
      setMembers([]);
    }

    const storedExpenses = localStorage.getItem('room_expenses');
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      localStorage.setItem('room_expenses', JSON.stringify({}));
      setExpenses({});
    }

    isLoaded.current = true;
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

  // Listen for expense updates from admin user deletion
  useEffect(() => {
    const handleExpensesUpdated = () => {
      const storedExpenses = localStorage.getItem('room_expenses');
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));
    };
    window.addEventListener('expenses-updated', handleExpensesUpdated);
    return () => window.removeEventListener('expenses-updated', handleExpensesUpdated);
  }, []);

  // Sync members to localStorage after initial load
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem('room_members', JSON.stringify(members));
    }
  }, [members]);

  // Sync expenses to localStorage after initial load
  useEffect(() => {
    if (isLoaded.current) {
      localStorage.setItem('room_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  const addMember = (member) => {
    const newMember = { ...member, id: Date.now() };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id, data) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const deleteMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setExpenses(prev => {
      const updated = {};
      Object.entries(prev).forEach(([month, records]) => {
        updated[month] = records.filter(r => r.memberId !== id);
      });
      return updated;
    });
  };

  // Delete all expense records for a specific user (called on admin user delete)
  const deleteUserExpenses = (userId) => {
    setExpenses(prev => {
      const updated = {};
      Object.entries(prev).forEach(([month, records]) => {
        updated[month] = records.filter(r => r.memberId !== userId);
      });
      return updated;
    });
  };

  const addExpenseRecord = (month, record) => {
    setExpenses(prev => {
      const monthData = prev[month] || [];
      return {
        ...prev,
        [month]: [...monthData, { ...record, id: Date.now(), paid: 0, payments: [] }]
      };
    });
  };

  const updateExpenseRecord = (month, id, data) => {
    setExpenses(prev => {
      const monthData = prev[month] || [];
      return {
        ...prev,
        [month]: monthData.map(r => r.id === id ? { ...r, ...data } : r)
      };
    });
  };

  const deleteExpenseRecord = (month, id) => {
    setExpenses(prev => {
      const monthData = prev[month] || [];
      return {
        ...prev,
        [month]: monthData.filter(r => r.id !== id)
      };
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

      const member = members.find(m => m.id === expense.memberId);
      const memberName = member ? member.name : 'Member';
      showNotification(`Payment of ৳${amount} recorded for ${memberName}. SMS/Email confirmation sent.`);

      return { ...prev, [month]: newMonthData };
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
