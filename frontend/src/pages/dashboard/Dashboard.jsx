import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, TrendingUp, Wallet,
  LogOut, ChevronRight, Loader, X,
  Receipt
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getMyGroups, createGroup } from '../../api/groupApi';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await getMyGroups();
      setGroups(data);
    } catch (error) {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    setCreating(true);
    try {
      const newGroup = await createGroup(createForm.name, createForm.description);
      setGroups(prev => [newGroup, ...prev]);
      setShowCreateModal(false);
      setCreateForm({ name: '', description: '' });
      toast.success(`Group "${newGroup.name}" created!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Get first name only for mobile
  const firstName = user?.name?.split(' ')[0] || 'User';

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: 'rgba(10,15,30,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        gap: '8px',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', flexShrink: 0,
        }}>
          <span style={{ fontSize: '22px' }}>💸</span>
          <span style={{
            fontSize: '1.1rem', fontWeight: '800',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}>
            SmartSplit
          </span>
        </div>

        {/* Right side */}
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: '8px', minWidth: 0,
        }}>
          {/* Name badge — show only first name */}
          <div style={{
            background: 'var(--glass)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '120px',
          }}>
            👋 {firstName}
          </div>

          {/* Logout button — icon only on mobile */}
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(233,69,96,0.1)',
              border: '1px solid rgba(233,69,96,0.2)',
              borderRadius: '8px',
              padding: '7px 12px',
              color: 'var(--accent)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '13px',
              fontFamily: 'Syne,sans-serif',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <LogOut size={14} />
            {/* Hide text on very small screens */}
            <span style={{ display: window.innerWidth < 400 ? 'none' : 'inline' }}>
              Logout
            </span>
          </button>
        </div>
      </nav>

      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '1.5rem 1rem',
        width: '100%',
      }}>

        {/* ── WELCOME HEADER ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '1.5rem' }}
        >
          <h1 style={{
            fontSize: 'clamp(1.5rem, 5vw, 2rem)',
            fontWeight: '800',
            marginBottom: '0.25rem',
          }}>
            Your Groups
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
          }}>
            Manage shared expenses across all your groups
          </p>
        </motion.div>

        {/* ── STATS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            marginBottom: '1.5rem',
          }}
        >
          {[
            {
              icon: <Users size={18} />,
              label: 'Total Groups',
              value: groups.length,
              color: 'var(--blue)',
            },
            {
              icon: <Receipt size={18} />,
              label: 'Total Members',
              value: groups.reduce((sum, g) => sum + (g.members?.length || 0), 0),
              color: 'var(--green)',
            },
            {
              icon: <Wallet size={18} />,
              label: 'Active Since',
              value: new Date().getFullYear(),
              color: 'var(--gold)',
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card"
              style={{ padding: '1rem 0.875rem' }}
            >
              <div style={{
                width: '34px', height: '34px',
                borderRadius: '8px',
                background: `${stat.color}20`,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center',
                color: stat.color,
                marginBottom: '0.6rem',
              }}>
                {stat.icon}
              </div>
              <div style={{
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: '800',
                color: stat.color,
                lineHeight: 1,
                marginBottom: '4px',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontSize: 'clamp(9px, 2vw, 11px)',
                color: 'var(--text-secondary)',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── GROUPS HEADER ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          gap: '10px',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '700' }}>
            Your Groups
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 14px',
              fontFamily: 'Syne,sans-serif',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Plus size={15} /> New Group
          </button>
        </div>

        {/* ── GROUPS LIST ── */}
        {loading ? (
          <div style={{
            display: 'flex', justifyContent: 'center', padding: '3rem',
          }}>
            <Loader size={32} style={{
              color: 'var(--accent)',
              animation: 'spin 1s linear infinite',
            }} />
          </div>
        ) : groups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-card"
            style={{ padding: '3rem', textAlign: 'center' }}
          >
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🏝️</div>
            <h3 style={{
              fontSize: '1rem', fontWeight: '700', marginBottom: '0.5rem',
            }}>
              No groups yet
            </h3>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem', marginBottom: '1.5rem',
            }}>
              Create your first group to start splitting expenses
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
              style={{ maxWidth: '200px', margin: '0 auto' }}
            >
              Create Group
            </button>
          </motion.div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
          }}>
            {groups.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card"
                onClick={() => navigate(`/groups/${group.id}`)}
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                whileHover={{ borderColor: 'rgba(233,69,96,0.3)', y: -2 }}
              >
                <div style={{
                  display: 'flex', alignItems: 'flex-start',
                  justifyContent: 'space-between', marginBottom: '0.875rem',
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: 'linear-gradient(135deg,var(--accent),#ff6b81)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px', fontWeight: '700', color: '#fff',
                  }}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
                </div>

                <h3 style={{
                  fontSize: '1rem', fontWeight: '700', marginBottom: '4px',
                }}>
                  {group.name}
                </h3>

                {group.description && (
                  <p style={{
                    fontSize: '13px', color: 'var(--text-secondary)',
                    marginBottom: '0.75rem',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {group.description}
                  </p>
                )}

                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  marginTop: '0.875rem', paddingTop: '0.875rem',
                  borderTop: '1px solid var(--border)',
                }}>
                  {group.members?.slice(0, 4).map((member, idx) => (
                    <div
                      key={idx}
                      title={member.name}
                      style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: `hsl(${idx * 60},70%,50%)`,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700', color: '#fff',
                        border: '2px solid var(--bg-card)',
                        marginLeft: idx > 0 ? '-8px' : '0',
                        flexShrink: 0,
                      }}
                    >
                      {member.name?.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  <span style={{
                    fontSize: '12px', color: 'var(--text-secondary)',
                    marginLeft: '8px',
                  }}>
                    {group.members?.length} member
                    {group.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── CREATE GROUP MODAL ── */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)', zIndex: 200,
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px 20px 0 0',
                padding: '1.5rem',
                zIndex: 201,
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Handle bar */}
              <div style={{
                width: '40px', height: '4px',
                background: 'var(--border)',
                borderRadius: '2px',
                margin: '0 auto 1.25rem',
              }} />

              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '1.25rem',
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                  Create New Group
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
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

              <form onSubmit={handleCreateGroup}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block', fontSize: '13px',
                    fontWeight: '600', marginBottom: '6px',
                    color: 'var(--text-secondary)',
                  }}>
                    Group Name *
                  </label>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="e.g. Goa Trip 2026"
                    value={createForm.name}
                    onChange={e => setCreateForm(p => ({
                      ...p, name: e.target.value
                    }))}
                    autoFocus
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block', fontSize: '13px',
                    fontWeight: '600', marginBottom: '6px',
                    color: 'var(--text-secondary)',
                  }}>
                    Description (optional)
                  </label>
                  <textarea
                    className="input-field"
                    placeholder="What is this group for?"
                    rows={3}
                    value={createForm.description}
                    onChange={e => setCreateForm(p => ({
                      ...p, description: e.target.value
                    }))}
                    style={{ resize: 'none' }}
                  />
                </div>

                <button
                  className="btn-primary"
                  type="submit"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Group'}
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

export default Dashboard;