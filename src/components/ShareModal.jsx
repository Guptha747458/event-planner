import React, { useState } from 'react';
import { X, Share2, Copy, Check, Globe, Link2 } from 'lucide-react';

export default function ShareModal({ planId, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}${window.location.pathname}?planId=${planId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const s = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(3, 5, 12, 0.82)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    },
    modal: {
      position: 'relative',
      width: '100%',
      maxWidth: '460px',
      backgroundColor: '#0c0e18',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '20px',
      boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 50px rgba(147,51,234,0.18)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: '0.75rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    },
    btnClose: {
      padding: '0.4rem',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#94a3b8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    input: {
      flex: 1,
      backgroundColor: '#07080f',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      padding: '0.65rem 0.85rem',
      fontSize: '0.75rem',
      color: '#cbd5e1',
      fontFamily: 'monospace',
      outline: 'none'
    },
    btnCopy: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.65rem 1rem',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
      color: '#ffffff',
      fontWeight: 600,
      fontSize: '0.8rem',
      border: 'none',
      cursor: 'pointer',
      whiteSpace: 'nowrap'
    },
    cloudCard: {
      padding: '0.85rem 1rem',
      borderRadius: '12px',
      background: 'rgba(147, 51, 234, 0.1)',
      border: '1px solid rgba(147, 51, 234, 0.22)',
      fontSize: '0.75rem',
      color: '#d8b4fe',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.4rem'
    }
  };

  return (
    <div style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={s.modal}>
        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Share2 style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
              Share Your Event Plan
            </h3>
          </div>
          <button onClick={onClose} style={s.btnClose} title="Close modal">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
          Anyone with this link can view this event plan, track budget allocations, and review milestones in real time.
        </p>

        {/* Share Link Input */}
        <div>
          <label style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#94a3b8',
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.4rem'
          }}>
            Shareable Plan Link
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              style={s.input}
            />
            <button onClick={handleCopy} style={s.btnCopy} id="btn-copy-share-url">
              {copied ? (
                <>
                  <Check style={{ width: 14, height: 14, color: '#34d399' }} />
                  <span style={{ color: '#34d399' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy style={{ width: 14, height: 14 }} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Cloud details */}
        <div style={s.cloudCard}>
          <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe style={{ width: 14, height: 14 }} />
            <span>Persistent Plan Reference</span>
          </span>
          <p style={{ color: 'rgba(233, 213, 255, 0.85)', fontSize: '0.725rem' }}>
            Plan ID: <code style={{ background: 'rgba(147, 51, 234, 0.35)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace' }}>{planId || 'active-plan'}</code>.
            Revisit anytime by opening this link in your browser.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.25rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
