import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// This component pings the backend health endpoint.
// If backend is sleeping (Render free tier), it shows
// a friendly message instead of a broken blank screen.
// Once backend responds, it disappears automatically.
const ServerWakeUp = ({ children }) => {
  const [serverStatus, setServerStatus] = useState('checking');
  // checking = pinging server
  // awake    = server responded, show app
  // sleeping = server is starting up, show message

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL ||
      'http://localhost:8080/api';

    try {
      // Ping the health endpoint with 5 second timeout first
      await axios.get(`${baseURL}/health`, { timeout: 5000 });
      setServerStatus('awake');
    } catch (error) {
      if (error.code === 'ECONNABORTED' || !error.response) {
        // Server is sleeping — show wake up message
        setServerStatus('sleeping');
        // Keep pinging every 5 seconds until it wakes
        pollUntilAwake(baseURL);
      } else {
        // Server responded with an error but IS awake
        setServerStatus('awake');
      }
    }
  };

  const pollUntilAwake = (baseURL) => {
    const interval = setInterval(async () => {
      try {
        await axios.get(`${baseURL}/health`, { timeout: 8000 });
        setServerStatus('awake');
        clearInterval(interval);
      } catch {
        // Still sleeping — keep trying
      }
    }, 5000);

    // Stop polling after 2 minutes no matter what
    setTimeout(() => {
      clearInterval(interval);
      setServerStatus('awake');
    }, 120000);
  };

  // Server is awake — show the actual app
  if (serverStatus === 'awake') {
    return children;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          textAlign: 'center',
          maxWidth: '400px',
        }}
      >
        {/* Animated logo */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          style={{
            width: '72px', height: '72px',
            borderRadius: '20px',
            background: 'linear-gradient(135deg,#e94560,#ff6b81)',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '32px',
          }}
        >
          💸
        </motion.div>

        <h2 style={{
          fontSize: '1.4rem', fontWeight: '800',
          marginBottom: '0.75rem',
          color: 'var(--text-primary)',
        }}>
          SmartSplit is waking up
        </h2>

        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '2rem',
        }}>
          Our free server goes to sleep after inactivity.
          It will be ready in about <strong style={{ color: 'var(--accent)' }}>
            30 seconds
          </strong>. Please wait...
        </p>

        {/* Animated progress bar */}
        <div style={{
          height: '4px',
          background: 'var(--surface)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '1rem',
        }}>
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'easeInOut',
            }}
            style={{
              height: '100%',
              width: '40%',
              background: 'linear-gradient(90deg,transparent,var(--accent),transparent)',
              borderRadius: '2px',
            }}
          />
        </div>

        {/* Dots animation */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                delay: i * 0.2,
              }}
              style={{
                width: '8px', height: '8px',
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          ))}
        </div>

        {serverStatus === 'checking' && (
          <p style={{
            marginTop: '1.5rem',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            Checking server status...
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default ServerWakeUp;