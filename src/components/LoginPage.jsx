import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  HardDrive,
  ArrowRight,
  UserCheck,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { loginUser, registerUser, loginDemoUser, loginGuestUser } from '../utils/localAuth.js';

const AVATAR_OPTIONS = ['✨', '🎉', '💍', '🎂', '🎪', '🥂', '🚀', '🌸'];

export default function LoginPage({ onLoginSuccess, onClose, isModal = false }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('✨');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = loginUser(email, password);
    if (!res.success) {
      setError(res.error);
      return;
    }

    setSuccessMsg(`Welcome back, ${res.user.name}!`);
    setTimeout(() => {
      onLoginSuccess(res.user);
    }, 400);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = registerUser({
      name,
      email,
      password,
      avatar: selectedAvatar
    });

    if (!res.success) {
      setError(res.error);
      return;
    }

    setSuccessMsg(`Account created on device! Welcome, ${res.user.name}.`);
    setTimeout(() => {
      onLoginSuccess(res.user);
    }, 500);
  };

  const handleQuickDemo = () => {
    setError('');
    const res = loginDemoUser();
    setSuccessMsg('Logged in with Demo Account (Sophia Hayes)');
    setTimeout(() => {
      onLoginSuccess(res.user);
    }, 350);
  };

  const handleContinueGuest = () => {
    setError('');
    const res = loginGuestUser();
    setSuccessMsg('Continuing as Guest Planner');
    setTimeout(() => {
      onLoginSuccess(res.user);
    }, 300);
  };

  // Modern glassmorphism inline styles
  const s = {
    wrapper: isModal ? {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
      backgroundColor: 'rgba(3, 5, 12, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    } : {
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    },
    card: {
      position: 'relative',
      width: '100%',
      maxWidth: '480px',
      backgroundColor: '#0c0e18',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '24px',
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(147, 51, 234, 0.16)',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    },
    closeBtn: {
      position: 'absolute',
      top: '1.25rem',
      right: '1.25rem',
      padding: '0.45rem',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#94a3b8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    brandBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.25rem 0.65rem',
      borderRadius: '9999px',
      background: 'rgba(147, 51, 234, 0.15)',
      border: '1px solid rgba(147, 51, 234, 0.3)',
      color: '#c084fc',
      fontSize: '0.7rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'uppercase'
    },
    deviceBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.6rem 0.85rem',
      borderRadius: '12px',
      background: 'rgba(16, 185, 129, 0.08)',
      border: '1px solid rgba(16, 185, 129, 0.22)',
      color: '#6ee7b7',
      fontSize: '0.725rem'
    },
    tabBar: {
      display: 'flex',
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '0.25rem',
      gap: '0.25rem'
    },
    tabBtn: (active) => ({
      flex: 1,
      padding: '0.65rem',
      borderRadius: '9px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.825rem',
      fontWeight: active ? 700 : 500,
      color: active ? '#ffffff' : '#94a3b8',
      background: active ? 'linear-gradient(135deg, #9333ea, #7c3aed)' : 'transparent',
      boxShadow: active ? '0 2px 10px rgba(147, 51, 234, 0.4)' : 'none',
      transition: 'all 0.15s ease'
    }),
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.35rem'
    },
    label: {
      fontSize: '0.725rem',
      fontWeight: 600,
      color: '#94a3b8',
      textTransform: 'uppercase',
      letterSpacing: '0.04em'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: {
      position: 'absolute',
      left: '0.85rem',
      width: '16px',
      height: '16px',
      color: '#64748b'
    },
    input: {
      width: '100%',
      backgroundColor: '#070913',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      padding: '0.7rem 0.85rem 0.7rem 2.5rem',
      fontSize: '0.85rem',
      color: '#f8fafc',
      outline: 'none',
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
    },
    btnPrimary: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%',
      padding: '0.8rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '0.9rem',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 18px rgba(147, 51, 234, 0.45)',
      marginTop: '0.4rem',
      transition: 'transform 0.15s ease'
    },
    divider: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#475569',
      fontSize: '0.725rem',
      textTransform: 'uppercase',
      letterSpacing: '0.05em'
    },
    dividerLine: {
      flex: 1,
      height: '1px',
      backgroundColor: 'rgba(255, 255, 255, 0.08)'
    },
    btnSecondary: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%',
      padding: '0.65rem',
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#cbd5e1',
      fontSize: '0.8rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    }
  };

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        {/* Optional Close Button */}
        {onClose && (
          <button onClick={onClose} style={s.closeBtn} title="Close">
            <X style={{ width: 16, height: 16 }} />
          </button>
        )}

        {/* Brand & Title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #7c3aed, #9333ea, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(147,51,234,0.45)'
            }}>
              <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.4rem', color: '#ffffff' }}>
              Aura<span style={{ color: '#c084fc' }}>Plan</span>
            </span>
          </div>

          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
            {mode === 'login' ? 'Welcome Back to Your Planner' : 'Create On-Device Account'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            {mode === 'login'
              ? 'Access your saved events, budgets, and milestones stored safely on this device.'
              : 'Set up an organizer profile stored entirely inside your local browser storage.'}
          </p>
        </div>

        {/* Device-Only Privacy Banner */}
        <div style={s.deviceBadge}>
          <HardDrive style={{ width: 16, height: 16, flexShrink: 0, color: '#34d399' }} />
          <div>
            <strong style={{ color: '#34d399', display: 'block' }}>100% On-Device Storage</strong>
            <span style={{ color: 'rgba(209, 250, 229, 0.85)', fontSize: '0.7rem' }}>
              Your account details and event plans stay strictly on this computer. No remote database tracking.
            </span>
          </div>
        </div>

        {/* Tabs: Sign In / Create Account */}
        <div style={s.tabBar}>
          <button
            type="button"
            onClick={() => handleModeSwitch('login')}
            style={s.tabBtn(mode === 'login')}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('register')}
            style={s.tabBtn(mode === 'register')}
          >
            Create Account
          </button>
        </div>

        {/* Feedback alerts */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.85rem', borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.28)',
            color: '#fca5a5', fontSize: '0.775rem'
          }}>
            <AlertCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.65rem 0.85rem', borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#6ee7b7', fontSize: '0.775rem'
          }}>
            <CheckCircle style={{ width: 15, height: 15, flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          {mode === 'register' && (
            <>
              <div style={s.inputGroup}>
                <label style={s.label}>Full Name</label>
                <div style={s.inputWrapper}>
                  <User style={s.inputIcon} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan Miller"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={s.input}
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div style={s.inputGroup}>
                <label style={s.label}>Choose Organizer Icon</label>
                <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      type="button"
                      key={av}
                      onClick={() => setSelectedAvatar(av)}
                      style={{
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        background: selectedAvatar === av ? 'rgba(147, 51, 234, 0.3)' : 'rgba(255, 255, 255, 0.04)',
                        border: selectedAvatar === av ? '1px solid #c084fc' : '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={s.inputGroup}>
            <label style={s.label}>Email Address</label>
            <div style={s.inputWrapper}>
              <Mail style={s.inputIcon} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={s.input}
              />
            </div>
          </div>

          <div style={s.inputGroup}>
            <label style={s.label}>Password</label>
            <div style={s.inputWrapper}>
              <Lock style={s.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...s.input, paddingRight: '2.5rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
              </button>
            </div>
          </div>

          <button type="submit" style={s.btnPrimary}>
            <span>{mode === 'login' ? 'Sign In to Device' : 'Create Device Account'}</span>
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        </form>

        {/* Divider */}
        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span>Quick Access Options</span>
          <div style={s.dividerLine} />
        </div>

        {/* Demo & Guest Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleQuickDemo}
            style={{
              ...s.btnSecondary,
              background: 'rgba(147, 51, 234, 0.1)',
              borderColor: 'rgba(147, 51, 234, 0.3)',
              color: '#d8b4fe'
            }}
          >
            <UserCheck style={{ width: 15, height: 15, color: '#c084fc' }} />
            <span>Try Demo Account: Sophia Hayes</span>
          </button>

          <button
            type="button"
            onClick={handleContinueGuest}
            style={s.btnSecondary}
          >
            <span>Continue as Guest Planner</span>
          </button>
        </div>

        {/* Security / Privacy reassurance */}
        <div style={{
          paddingTop: '0.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.4rem',
          fontSize: '0.7rem',
          color: '#64748b'
        }}>
          <ShieldCheck style={{ width: 14, height: 14, color: '#10b981' }} />
          <span>Encrypted inside your browser local storage</span>
        </div>
      </div>
    </div>
  );
}

