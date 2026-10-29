import React, { useState, useEffect } from 'react';
import { Sparkles, Key, Check, AlertCircle, RefreshCw, ExternalLink, X, ShieldAlert, Cpu, CheckCircle2 } from 'lucide-react';

export default function ApiKeyModal({ onClose, onKeyUpdated }) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-3.5-flash-lite');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusData, setStatusData] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchApiStatus();
  }, []);

  const fetchApiStatus = async () => {
    try {
      const res = await fetch('/api/api-status');
      const data = await res.json();
      if (data.success) {
        setStatusData(data);
        if (data.model) setModel(data.model);
      }
    } catch (e) {
      console.warn('Failed to fetch API status:', e);
    }
  };

  const handleSaveAndTest = async (e) => {
    e.preventDefault();
    if (!apiKey.trim() && !model) return;

    setIsLoading(true);
    setFeedback({ type: 'loading', msg: 'Testing connection to Google Gemini API...' });

    try {
      const res = await fetch('/api/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: model.trim(),
          testFirst: true
        })
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          msg: `✓ Successfully connected to Gemini using ${model}! API key is now active.`
        });
        setStatusData({ ...statusData, status: 'active', configured: true, model });
        if (onKeyUpdated) onKeyUpdated(model);
        setApiKey('');
      } else {
        setFeedback({
          type: 'error',
          msg: data.message || 'API test failed. Server fallback remains active.'
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: `Connection error: ${err.message}. Offline AI fallback engine remains active.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isServerIssue = statusData?.status === 'server_issue';
  const isOffline = statusData?.status === 'offline_fallback' || !statusData?.configured;

  const s = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 120,
      backgroundColor: 'rgba(3, 5, 12, 0.86)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    },
    modal: {
      position: 'relative',
      width: '100%',
      maxWidth: '520px',
      backgroundColor: '#0c0e18',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '20px',
      boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 50px rgba(147,51,234,0.18)',
      padding: '1.75rem',
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
    closeBtn: {
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
    statusCard: {
      padding: '0.85rem 1rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.65rem',
      fontSize: '0.75rem',
      background: isServerIssue
        ? 'rgba(245, 158, 11, 0.12)'
        : isOffline
        ? 'rgba(100, 116, 139, 0.12)'
        : 'rgba(16, 185, 129, 0.12)',
      border: `1px solid ${
        isServerIssue
          ? 'rgba(245, 158, 11, 0.3)'
          : isOffline
          ? 'rgba(100, 116, 139, 0.25)'
          : 'rgba(16, 185, 129, 0.3)'
      }`,
      color: isServerIssue ? '#fbbf24' : isOffline ? '#cbd5e1' : '#6ee7b7'
    },
    input: {
      width: '100%',
      backgroundColor: '#07080f',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      padding: '0.65rem 0.85rem',
      fontSize: '0.8rem',
      color: '#f8fafc',
      outline: 'none',
      fontFamily: 'monospace'
    },
    select: {
      width: '100%',
      backgroundColor: '#07080f',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '10px',
      padding: '0.65rem 0.85rem',
      fontSize: '0.8rem',
      color: '#f8fafc',
      outline: 'none'
    },
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.45rem',
      padding: '0.7rem 1.25rem',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
      color: '#ffffff',
      fontWeight: 700,
      fontSize: '0.825rem',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)'
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
              <Key style={{ width: 16, height: 16, color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>
                Gemini GenAI &amp; API Configuration
              </h3>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Real-time API status, custom keys, and failover model selector
              </span>
            </div>
          </div>
          <button onClick={onClose} style={s.closeBtn} title="Close">
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        {/* Live Status Card */}
        <div style={s.statusCard}>
          {isServerIssue ? (
            <ShieldAlert style={{ width: 18, height: 18, flexShrink: 0, color: '#fbbf24' }} />
          ) : isOffline ? (
            <Cpu style={{ width: 18, height: 18, flexShrink: 0, color: '#94a3b8' }} />
          ) : (
            <CheckCircle2 style={{ width: 18, height: 18, flexShrink: 0, color: '#34d399' }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.8rem' }}>
              {isServerIssue
                ? 'Gemini Experiencing Server Issues / High Demand'
                : isOffline
                ? 'Offline Procedural AI Mode Active'
                : 'Gemini AI Connection Active & Ready'}
            </div>
            <p style={{ marginTop: '0.2rem', fontSize: '0.7rem', opacity: 0.9, lineHeight: 1.4 }}>
              {isServerIssue
                ? 'Google’s Gemini server recently returned a temporary 503/timeout. AuraPlan’s instant offline calculation engine is handling plans safely. You can add a new key or switch models below.'
                : isOffline
                ? 'AuraPlan is generating mathematically balanced budgets and timelines using its procedural fallback engine.'
                : `Currently routing plan generation and natural language budget recalculations through ${model}.`}
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div style={{
            padding: '0.65rem 0.85rem',
            borderRadius: '10px',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: feedback.type === 'success'
              ? 'rgba(16, 185, 129, 0.15)'
              : feedback.type === 'error'
              ? 'rgba(239, 68, 68, 0.15)'
              : 'rgba(147, 51, 234, 0.15)',
            border: `1px solid ${
              feedback.type === 'success'
                ? 'rgba(16, 185, 129, 0.3)'
                : feedback.type === 'error'
                ? 'rgba(239, 68, 68, 0.3)'
                : 'rgba(147, 51, 234, 0.3)'
            }`,
            color: feedback.type === 'success' ? '#6ee7b7' : feedback.type === 'error' ? '#fca5a5' : '#c084fc'
          }}>
            {feedback.type === 'loading' && <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} />}
            {feedback.type === 'success' && <Check style={{ width: 14, height: 14 }} />}
            {feedback.type === 'error' && <AlertCircle style={{ width: 14, height: 14 }} />}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSaveAndTest} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Add / Update Gemini API Key
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="Paste new Gemini API Key (starts with AIzaSy...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={s.input}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.7rem',
                  cursor: 'pointer'
                }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Target Gemini Model
            </label>
            <select value={model} onChange={(e) => setModel(e.target.value)} style={s.select}>
              <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Recommended / Fast)</option>
              <option value="gemini-flash-latest">gemini-flash-latest (Standard Flash)</option>
              <option value="gemini-2.5-flash">gemini-2.5-flash</option>
              <option value="gemini-pro-latest">gemini-pro-latest (Pro Model)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem' }}>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.725rem',
                color: '#c084fc',
                textDecoration: 'none'
              }}
            >
              <span>Get Free API Key</span>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </a>

            <button type="submit" disabled={isLoading} style={s.btnPrimary}>
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" style={{ width: 14, height: 14 }} />
                  <span>Testing &amp; Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 14, height: 14 }} />
                  <span>Activate &amp; Test Key</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

