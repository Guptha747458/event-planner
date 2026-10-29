import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Share2, Printer, PlusCircle, User, LogOut, HardDrive, ChevronDown, Key, Clock } from 'lucide-react';

export default function Navbar({
  onNewPlan,
  onExport,
  onShare,
  currentPlan,
  currentUser,
  onOpenLogin,
  onLogout,
  onOpenApiKeyModal,
  apiStatus = 'active'
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="no-print" style={{
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(8,10,20,0.88)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      position: 'sticky', top: 0, zIndex: 40
    }}>
      <div style={{
        maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem',
        height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            onClick={onNewPlan}
            style={{
              width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #7c3aed, #9333ea, #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(147,51,234,0.45)',
              cursor: 'pointer'
            }}
          >
            <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span
                onClick={onNewPlan}
                style={{
                  fontFamily: "'Outfit', sans-serif", fontWeight: 800,
                  fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                Aura<span style={{ color: '#c084fc' }}>Plan</span>
              </span>

              {/* Interactive Gemini AI Status / Settings Badge */}
              <button
                type="button"
                onClick={onOpenApiKeyModal}
                id="btn-gemini-status"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                  background: apiStatus === 'server_issue'
                    ? 'rgba(245, 158, 11, 0.2)'
                    : apiStatus === 'offline_fallback'
                    ? 'rgba(100, 116, 139, 0.2)'
                    : 'rgba(147, 51, 234, 0.18)',
                  color: apiStatus === 'server_issue'
                    ? '#fbbf24'
                    : apiStatus === 'offline_fallback'
                    ? '#cbd5e1'
                    : '#c084fc',
                  border: `1px solid ${
                    apiStatus === 'server_issue'
                      ? 'rgba(245, 158, 11, 0.4)'
                      : apiStatus === 'offline_fallback'
                      ? 'rgba(100, 116, 139, 0.3)'
                      : 'rgba(147, 51, 234, 0.35)'
                  }`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Click to view AI status, change API key, or switch model"
              >
                <span style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: apiStatus === 'server_issue' ? '#fbbf24' : apiStatus === 'offline_fallback' ? '#94a3b8' : '#34d399',
                  display: 'inline-block'
                }} />
                <span>{apiStatus === 'server_issue' ? 'AI Alert' : 'Gemini AI'}</span>
                <Key style={{ width: 10, height: 10, opacity: 0.7 }} />
              </button>
            </div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', display: 'none', marginTop: '1px' }}
               className="sm-show">Intelligent Event Planning Assistant</p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {currentPlan && (
            <>
              <button
                onClick={onShare}
                id="btn-share-plan"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <Share2 style={{ width: '14px', height: '14px', color: '#c084fc' }} />
                <span>Share</span>
              </button>

              <button
                onClick={onExport}
                id="btn-export-plan"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#94a3b8', fontSize: '0.82rem', fontWeight: 500, transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
              >
                <Printer style={{ width: '14px', height: '14px', color: '#22d3ee' }} />
                <span>Export</span>
              </button>
            </>
          )}

          <button
            onClick={onNewPlan}
            id="btn-new-plan"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.45rem',
              padding: '0.55rem 1.15rem', borderRadius: '10px', cursor: 'pointer',
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
              border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700,
              boxShadow: '0 4px 14px rgba(147,51,234,0.4)', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(147,51,234,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(147,51,234,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <PlusCircle style={{ width: '14px', height: '14px' }} />
            <span>{currentPlan ? 'New Event' : 'Get Started'}</span>
          </button>

          {/* User Profile / Temporary Guest Pill */}
          {currentUser ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                id="btn-user-profile"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.45rem',
                  padding: '0.45rem 0.8rem', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s'
                }}
                title="Your on-device account"
              >
                <span style={{ fontSize: '1rem' }}>{currentUser.avatar || '✨'}</span>
                <span style={{ maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.name ? currentUser.name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown style={{ width: 12, height: 12, color: '#94a3b8' }} />
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '260px',
                  backgroundColor: '#0c0e18',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.85), 0 0 30px rgba(147, 51, 234, 0.15)',
                  padding: '1rem',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}>
                  {/* User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: 'rgba(147, 51, 234, 0.2)', border: '1px solid rgba(147, 51, 234, 0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {currentUser.avatar || '✨'}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {currentUser.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {currentUser.email}
                      </div>
                    </div>
                  </div>

                  {/* Device Storage Badge */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.45rem 0.65rem', borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
                    color: '#6ee7b7', fontSize: '0.7rem'
                  }}>
                    <HardDrive style={{ width: 13, height: 13, flexShrink: 0 }} />
                    <span>Saved permanently on device</span>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.08)' }} />

                  {/* Switch Account / Sign Out */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenLogin();
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.45rem 0.65rem', borderRadius: '8px',
                        background: 'transparent', border: 'none',
                        color: '#cbd5e1', fontSize: '0.775rem', cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <User style={{ width: 14, height: 14, color: '#c084fc' }} />
                      <span>Switch Account</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      id="btn-logout"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.45rem 0.65rem', borderRadius: '8px',
                        background: 'transparent', border: 'none',
                        color: '#f87171', fontSize: '0.775rem', cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <LogOut style={{ width: 14, height: 14 }} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span
                style={{
                  display: 'none',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.7rem',
                  color: '#94a3b8',
                  padding: '0.3rem 0.55rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
                className="sm-show"
                title="Your plan is temporary and will be cleared when this browser tab closes"
              >
                <Clock style={{ width: 12, height: 12, color: '#f59e0b' }} />
                <span>Guest Session (Temporary)</span>
              </span>

              <button
                onClick={onOpenLogin}
                id="btn-open-login"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.5rem 0.95rem', borderRadius: '10px', cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1', fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'; e.currentTarget.style.color = '#cbd5e1'; }}
                title="Sign in to save this plan permanently to your device"
              >
                <User style={{ width: '14px', height: '14px', color: '#c084fc' }} />
                <span>Sign In to Save</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
