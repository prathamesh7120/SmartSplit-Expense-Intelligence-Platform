import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { registerUser } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  // One state object for all form fields.
  // Cleaner than three separate useState calls.
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Single handler for all inputs.
  // e.target.name matches the "name" attribute on each input.
  // ...prev = spread all existing fields,
  // then override only the one that changed.
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    // Prevent default HTML form submission (page reload).
    e.preventDefault();

    // Client-side validation before hitting the API
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }

    if (form.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      // Call your Spring Boot register endpoint
      const data = await registerUser(
        form.name,
        form.email,
        form.password
      );

      // Save token and user info to AuthContext + localStorage
      login(
        { name: data.name, email: data.email },
        data.token
      );

      toast.success(`Welcome, ${data.name}!`);

      // Redirect to dashboard after successful register
      navigate('/dashboard');

    } catch (error) {
      // error.response.data.message = your GlobalExceptionHandler message
      const message =
        error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      // Always runs — stops loading spinner whether success or failure
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>

      {/* motion.div = framer-motion animated div.
          initial = starting state (invisible, shifted down 20px)
          animate = end state (visible, normal position)
          transition = how long and what easing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '420px' }}
      >

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #e94560, #ff6b81)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '24px',
            }}
          >
            💸
          </motion.div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '800',
            marginBottom: '0.5rem',
          }}>
            SmartSplit
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Create your account to get started
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>

            {/* Name Field */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-secondary)',
              }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  type="text"
                  name="name"
                  placeholder="Prathamesh Desai"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Field */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-secondary)',
              }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-secondary)',
              }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)',
                  }}
                />
                <input
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  type="password"
                  name="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  <Loader size={16} className="spin" />
                  Creating account...
                </span>
              ) : (
                <span style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  Create Account
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--accent)', fontWeight: '600' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;