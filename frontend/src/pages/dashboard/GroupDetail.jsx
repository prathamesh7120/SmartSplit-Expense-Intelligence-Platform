import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Users, Receipt,
  TrendingUp, X, Loader,
  UserPlus, CheckCircle, Circle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getGroupById, addMember } from '../../api/groupApi';
import {
  getGroupExpenses,
  createExpense,
  getGroupBalance
} from '../../api/expenseApi';
import {
  PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const CATEGORY_COLORS = {
  FOOD: '#e94560',
  TRAVEL: '#38bdf8',
  ACCOMMODATION: '#8b5cf6',
  ENTERTAINMENT: '#f59e0b',
  UTILITIES: '#10b981',
  OTHER: '#94a3b8',
};

const CATEGORY_ICONS = {
  FOOD: '🍕',
  TRAVEL: '✈️',
  ACCOMMODATION: '🏨',
  ENTERTAINMENT: '🎮',
  UTILITIES: '💡',
  OTHER: '📦',
};

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    amount: '',
    category: 'FOOD',
    splitType: 'EQUAL',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [groupId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [groupData, expensesData, balanceData] = await Promise.all([
        getGroupById(groupId),
        getGroupExpenses(groupId),
        getGroupBalance(groupId),
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setBalance(balanceData);
    } catch (error) {
      toast.error('Failed to load group data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.title || !expenseForm.amount) {
      toast.error('Title and amount are required');
      return;
    }
    if (parseFloat(expenseForm.amount) <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    setSubmitting(true);
    try {
      await createExpense(groupId, {
        title: expenseForm.title,
        amount: parseFloat(expenseForm.amount),
        category: expenseForm.category,
        splitType: expenseForm.splitType,
        description: expenseForm.description,
      });
      toast.success('Expense added!');
      setShowAddExpense(false);
      setExpenseForm({
        title: '', amount: '', category: 'FOOD',
        splitType: 'EQUAL', description: '',
      });
      fetchAllData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) {
      toast.error('Email is required');
      return;
    }
    setAddingMember(true);
    try {
      const updatedGroup = await addMember(groupId, memberEmail);
      setGroup(updatedGroup);
      setMemberEmail('');
      setShowAddMember(false);
      toast.success('Member added successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const chartData = expenses.reduce((acc, expense) => {
    const existing = acc.find(item => item.name === expense.category);
    if (existing) {
      existing.value += parseFloat(expense.amount);
    } else {
      acc.push({ name: expense.category, value: parseFloat(expense.amount) });
    }
    return acc;
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh',
      }}>
        <Loader size={36} style={{
          color: 'var(--accent)',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  const myBalance = balance?.memberBalances?.find(
    m => m.userName === user?.name
  );

  // ── BOTTOM SHEET MODAL STYLE (mobile native feel) ──
  const bottomSheetStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '20px 20px 0 0',
    padding: '0 1.25rem 2rem',
    zIndex: 201,
    maxHeight: '92vh',
    overflowY: 'auto',
  };

  const backdropStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(4px)',
    zIndex: 200,
  };

  const labelStyle = {
    display: 'block', fontSize: '13px',
    fontWeight: '600', marginBottom: '5px',
    color: 'var(--text-secondary)',
  };

  const fieldWrap = { marginBottom: '0.65rem' };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0.875rem 1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        gap: '8px',
      }}>
        {/* Left — back + group name */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', minWidth: 0, flex: 1,
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--glass)',
              border: '1px solid var(--border)',
              borderRadius: '8px', padding: '7px',
              cursor: 'pointer', color: 'var(--text-secondary)',
              display: 'flex', flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} />
          </button>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '0.95rem', fontWeight: '700',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {group?.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {group?.members?.length} members
            </div>
          </div>
        </div>

        {/* Right — action buttons */}
        <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
          {/* Add Member — icon only on mobile */}
          <button
            onClick={() => setShowAddMember(true)}
            style={{
              background: 'rgba(56,189,248,0.1)',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: '8px', padding: '8px',
              color: 'var(--blue)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '13px', fontFamily: 'Syne,sans-serif',
              fontWeight: '600',
            }}
          >
            <UserPlus size={15} />
          </button>

          {/* Add Expense */}
          <button
            onClick={() => setShowAddExpense(true)}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '8px',
              padding: '8px 12px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '13px', fontFamily: 'Syne,sans-serif',
              fontWeight: '600', whiteSpace: 'nowrap',
            }}
          >
            <Plus size={14} /> Add
          </button>
        </div>
      </nav>

      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '1.25rem 1rem',
        width: '100%',
      }}>

        {/* ── BALANCE CARD ── */}
        {myBalance && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              borderRadius: '14px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              background: myBalance.netBalance >= 0
                ? 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(16,185,129,0.05))'
                : 'linear-gradient(135deg,rgba(233,69,96,0.1),rgba(233,69,96,0.05))',
              border: `1px solid ${myBalance.netBalance >= 0
                ? 'rgba(16,185,129,0.25)' : 'rgba(233,69,96,0.25)'}`,
            }}
          >
            {/* Top row — big balance number */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{
                fontSize: '12px', fontWeight: '600',
                color: 'var(--text-secondary)', marginBottom: '4px',
                textTransform: 'uppercase', letterSpacing: '1px',
              }}>
                Your Balance
              </div>
              <div style={{
                fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                fontWeight: '800',
                color: myBalance.netBalance >= 0 ? 'var(--green)' : 'var(--accent)',
              }}>
                {myBalance.netBalance >= 0 ? '+' : ''}
                ₹{Math.abs(myBalance.netBalance).toFixed(2)}
              </div>
              <div style={{
                fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px',
              }}>
                {myBalance.netBalance > 0
                  ? 'You are owed this amount'
                  : myBalance.netBalance < 0
                  ? 'You owe this amount'
                  : 'You are all settled up! 🎉'}
              </div>
            </div>

            {/* Bottom row — 3 stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { label: 'You Paid', value: myBalance.totalPaid, color: 'var(--blue)' },
                { label: 'Your Share', value: myBalance.totalOwed, color: 'var(--gold)' },
                { label: 'Total', value: balance?.totalGroupSpend || 0, color: 'var(--text-primary)' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'clamp(0.85rem, 3vw, 1.1rem)',
                    fontWeight: '700', color: item.color,
                  }}>
                    ₹{parseFloat(item.value).toFixed(0)}
                  </div>
                  <div style={{
                    fontSize: 'clamp(9px, 2vw, 11px)',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                    fontWeight: '600',
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── TABS ── */}
        <div style={{
          display: 'flex', gap: '6px',
          marginBottom: '1.25rem',
          overflowX: 'auto',
          paddingBottom: '2px',
        }}>
          {[
            { key: 'expenses', label: 'Expenses', icon: <Receipt size={13} /> },
            { key: 'balances', label: 'Balances', icon: <TrendingUp size={13} /> },
            { key: 'members', label: 'Members', icon: <Users size={13} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                background: activeTab === tab.key ? 'var(--accent)' : 'var(--glass)',
                color: activeTab === tab.key ? '#fff' : 'var(--text-secondary)',
                border: `1px solid ${activeTab === tab.key
                  ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '10px',
                padding: '7px 14px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontFamily: 'Syne,sans-serif',
                fontWeight: '600', transition: 'all 0.2s',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── TAB: EXPENSES ── */}
        {activeTab === 'expenses' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {expenses.length === 0 ? (
              <div className="glass-card" style={{ padding: '2.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '44px', marginBottom: '0.75rem' }}>🧾</div>
                <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                  No expenses yet
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem', marginBottom: '1.25rem',
                }}>
                  Add your first expense to start tracking
                </p>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="btn-primary"
                  style={{ maxWidth: '180px', margin: '0 auto' }}
                >
                  Add Expense
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {expenses.map((expense, i) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="glass-card"
                    style={{ padding: '1rem' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between', gap: '10px',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: '10px', minWidth: 0, flex: 1,
                      }}>
                        <div style={{
                          width: '40px', height: '40px',
                          borderRadius: '10px', flexShrink: 0,
                          background: `${CATEGORY_COLORS[expense.category]}20`,
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '18px',
                        }}>
                          {CATEGORY_ICONS[expense.category]}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontWeight: '700', fontSize: '0.9rem',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {expense.title}
                          </div>
                          <div style={{
                            fontSize: '11px', color: 'var(--text-secondary)',
                          }}>
                            {expense.paidByName} · {new Date(
                              expense.createdAt
                            ).toLocaleDateString('en-IN')}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1rem', fontWeight: '800' }}>
                          ₹{parseFloat(expense.amount).toFixed(0)}
                        </div>
                        <div style={{
                          fontSize: '10px',
                          color: CATEGORY_COLORS[expense.category],
                          fontWeight: '600',
                          textTransform: 'uppercase',
                        }}>
                          {expense.category}
                        </div>
                      </div>
                    </div>

                    {/* Split badges */}
                    <div style={{
                      marginTop: '0.75rem', paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border)',
                      display: 'flex', flexWrap: 'wrap', gap: '6px',
                    }}>
                      {expense.splits?.map((split, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '11px',
                            background: split.isSettled
                              ? 'rgba(16,185,129,0.1)' : 'rgba(233,69,96,0.1)',
                            color: split.isSettled ? 'var(--green)' : 'var(--accent)',
                            padding: '3px 8px', borderRadius: '20px',
                            border: `1px solid ${split.isSettled
                              ? 'rgba(16,185,129,0.2)' : 'rgba(233,69,96,0.2)'}`,
                          }}
                        >
                          {split.isSettled
                            ? <CheckCircle size={10} />
                            : <Circle size={10} />}
                          {split.userName} ₹{parseFloat(split.amountOwed).toFixed(0)}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── TAB: BALANCES ── */}
        {activeTab === 'balances' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
              gap: '1rem',
            }}
          >
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{
                fontSize: '0.875rem', fontWeight: '700', marginBottom: '1rem',
              }}>
                Spending by Category
              </div>
              {chartData.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '2rem',
                  color: 'var(--text-secondary)', fontSize: '0.875rem',
                }}>
                  No expenses to chart yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={78}
                      paddingAngle={3} dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={CATEGORY_COLORS[entry.name] || '#94a3b8'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`₹${value.toFixed(2)}`, 'Amount']}
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        fontFamily: 'Syne,sans-serif',
                        fontSize: '12px',
                      }}
                    />
                    <Legend
                      formatter={(value) => (
                        <span style={{
                          color: 'var(--text-secondary)', fontSize: '11px',
                        }}>
                          {CATEGORY_ICONS[value]} {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{
                fontSize: '0.875rem', fontWeight: '700', marginBottom: '1rem',
              }}>
                Who Owes Whom
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {balance?.memberBalances?.map((member, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: '10px',
                      background: 'var(--glass)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      gap: '8px', minWidth: 0,
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: `hsl(${i * 60},70%,50%)`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px', fontWeight: '700',
                        color: '#fff', flexShrink: 0,
                      }}>
                        {member.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontSize: '0.82rem', fontWeight: '600',
                          overflow: 'hidden', textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {member.userName}
                          {member.userName === user?.name && (
                            <span style={{
                              fontSize: '10px', color: 'var(--blue)',
                              marginLeft: '4px',
                            }}>
                              (you)
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '11px', color: 'var(--text-secondary)',
                        }}>
                          Paid ₹{parseFloat(member.totalPaid).toFixed(0)}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.9rem', fontWeight: '700', flexShrink: 0,
                      color: member.netBalance >= 0
                        ? 'var(--green)' : 'var(--accent)',
                    }}>
                      {member.netBalance >= 0 ? '+' : ''}
                      ₹{parseFloat(member.netBalance).toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: '1rem', paddingTop: '1rem',
                borderTop: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '13px',
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Total Group Spend
                </span>
                <span style={{ fontWeight: '700', color: 'var(--gold)' }}>
                  ₹{parseFloat(balance?.totalGroupSpend || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── TAB: MEMBERS ── */}
        {activeTab === 'members' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
              gap: '10px',
            }}
          >
            {group?.members?.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card"
                style={{ padding: '1rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: `hsl(${i * 60},70%,50%)`,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0,
                    fontSize: '16px', fontWeight: '700', color: '#fff',
                  }}>
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontWeight: '700', fontSize: '0.875rem',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {member.name}
                      {member.email === user?.email && (
                        <span style={{
                          fontSize: '10px', color: 'var(--blue)',
                          marginLeft: '4px',
                        }}>
                          (you)
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '11px', color: 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {member.email}
                    </div>
                    <span style={{
                      fontSize: '10px', fontWeight: '700',
                      padding: '2px 7px', borderRadius: '20px',
                      marginTop: '4px', display: 'inline-block',
                      background: member.role === 'ADMIN'
                        ? 'rgba(233,69,96,0.1)' : 'rgba(56,189,248,0.1)',
                      color: member.role === 'ADMIN'
                        ? 'var(--accent)' : 'var(--blue)',
                      border: `1px solid ${member.role === 'ADMIN'
                        ? 'rgba(233,69,96,0.2)' : 'rgba(56,189,248,0.2)'}`,
                      textTransform: 'uppercase', letterSpacing: '1px',
                    }}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── ADD EXPENSE MODAL — bottom sheet ── */}
      <AnimatePresence>
        {showAddExpense && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExpense(false)}
              style={backdropStyle}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={bottomSheetStyle}
            >
              {/* Handle */}
              <div style={{
                width: '40px', height: '4px',
                background: 'var(--border)', borderRadius: '2px',
                margin: '1rem auto 1.25rem',
              }} />

              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '1rem',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  Add Expense
                </h3>
                <button
                  onClick={() => setShowAddExpense(false)}
                  style={{
                    background: 'var(--glass)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px', padding: '6px',
                    cursor: 'pointer', color: 'var(--text-secondary)',
                    display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddExpense}>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Title *</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. Dinner at restaurant"
                    value={expenseForm.title}
                    onChange={e => setExpenseForm(p => ({
                      ...p, title: e.target.value
                    }))}
                  />
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Amount (₹) *</label>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="0.00"
                    min="0.01" step="0.01"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm(p => ({
                      ...p, amount: e.target.value
                    }))}
                  />
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Category</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {Object.keys(CATEGORY_ICONS).map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => setExpenseForm(p => ({
                          ...p, category: cat
                        }))}
                        style={{
                          padding: '5px 10px', borderRadius: '8px',
                          border: `1px solid ${expenseForm.category === cat
                            ? CATEGORY_COLORS[cat] : 'var(--border)'}`,
                          background: expenseForm.category === cat
                            ? `${CATEGORY_COLORS[cat]}20` : 'var(--glass)',
                          color: expenseForm.category === cat
                            ? CATEGORY_COLORS[cat] : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: '12px',
                          fontFamily: 'Syne,sans-serif', fontWeight: '600',
                        }}
                      >
                        {CATEGORY_ICONS[cat]} {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={fieldWrap}>
                  <label style={labelStyle}>Split Type</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['EQUAL', 'CUSTOM'].map(type => (
                      <button
                        key={type} type="button"
                        onClick={() => setExpenseForm(p => ({
                          ...p, splitType: type
                        }))}
                        style={{
                          flex: 1, padding: '8px', borderRadius: '8px',
                          border: `1px solid ${expenseForm.splitType === type
                            ? 'var(--accent)' : 'var(--border)'}`,
                          background: expenseForm.splitType === type
                            ? 'rgba(233,69,96,0.1)' : 'var(--glass)',
                          color: expenseForm.splitType === type
                            ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: '13px',
                          fontFamily: 'Syne,sans-serif', fontWeight: '600',
                        }}
                      >
                        {type === 'EQUAL' ? '⚖️ Equal' : '✏️ Custom'}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={labelStyle}>Description (optional)</label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Any notes about this expense"
                    value={expenseForm.description}
                    onChange={e => setExpenseForm(p => ({
                      ...p, description: e.target.value
                    }))}
                  />
                </div>

                <button
                  className="btn-primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Adding...' : 'Add Expense'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── ADD MEMBER MODAL — bottom sheet ── */}
      <AnimatePresence>
        {showAddMember && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddMember(false)}
              style={backdropStyle}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={bottomSheetStyle}
            >
              <div style={{
                width: '40px', height: '4px',
                background: 'var(--border)', borderRadius: '2px',
                margin: '1rem auto 1.25rem',
              }} />

              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '1.25rem',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  Add Member
                </h3>
                <button
                  onClick={() => setShowAddMember(false)}
                  style={{
                    background: 'var(--glass)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px', padding: '6px',
                    cursor: 'pointer', color: 'var(--text-secondary)',
                    display: 'flex',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMember}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Member Email</label>
                  <input
                    className="input-field"
                    type="email"
                    placeholder="friend@example.com"
                    value={memberEmail}
                    onChange={e => setMemberEmail(e.target.value)}
                    autoFocus
                  />
                  <p style={{
                    fontSize: '12px', color: 'var(--text-secondary)',
                    marginTop: '6px',
                  }}>
                    They must already have a SmartSplit account
                  </p>
                </div>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={addingMember}
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GroupDetail;