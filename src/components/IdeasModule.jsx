import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Lightbulb, Copy, Check, BookmarkCheck, DollarSign } from 'lucide-react';

export default function IdeasModule({ ideas, onRegenerateIdeas, isRegenerating, metadata }) {
  const [copiedId, setCopiedId]   = useState(null);
  const [savedIds, setSavedIds]   = useState(new Set());

  const handleCopy = idea => {
    const text = `${idea.title}\n${idea.tagline}\nCost: ${idea.estimatedCost}\n${idea.description}\nDIY Tip: ${idea.diyTip}`;
    navigator.clipboard.writeText(text);
    setCopiedId(idea.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSave = id => {
    setSavedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const ACCENT_GRADIENTS = [
    'linear-gradient(135deg,#f472b6,#c084fc)',
    'linear-gradient(135deg,#fbbf24,#f97316)',
    'linear-gradient(135deg,#34d399,#22d3ee)',
    'linear-gradient(135deg,#818cf8,#a78bfa)',
    'linear-gradient(135deg,#fb7185,#f43f5e)',
    'linear-gradient(135deg,#c084fc,#60a5fa)'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Module Header */}
      <div style={{
        background: 'rgba(14,16,28,0.85)', backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem',
        display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem'
      }}>
        <div>
          <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles style={{ width: 18, height: 18, color: '#a855f7' }} />
            Personalized Idea Generator
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
            6 custom surprise concepts for <strong style={{ color: '#c084fc' }}>{metadata?.stylePreference || 'your style'}</strong> · budget <strong style={{ color: '#34d399' }}>${Number(metadata?.totalBudget || 15000).toLocaleString()}</strong>
          </p>
        </div>
        <button
          onClick={onRegenerateIdeas}
          disabled={isRegenerating}
          id="btn-regenerate-ideas"
          style={{
            display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.6rem 1.2rem',
            borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem',
            border: 'none', color: '#fff', whiteSpace: 'nowrap',
            background: isRegenerating ? 'rgba(147,51,234,0.35)' : 'linear-gradient(135deg,#9333ea,#7c3aed)',
            boxShadow: isRegenerating ? 'none' : '0 4px 14px rgba(147,51,234,0.4)',
            opacity: isRegenerating ? 0.7 : 1
          }}
        >
          {isRegenerating
            ? <><RefreshCw style={{ width: 14, height: 14, animation: 'spin 0.7s linear infinite' }} />Generating…</>
            : <><Wand2 style={{ width: 14, height: 14 }} />Surprise Me (Fresh 6)</>}
        </button>
      </div>

      {/* 6 Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {(ideas || []).map((idea, idx) => {
          const saved    = savedIds.has(idea.id);
          const copied   = copiedId === idea.id;
          const gradient = ACCENT_GRADIENTS[idx % 6];

          return (
            <div
              key={idea.id || idx}
              style={{
                background: saved ? 'rgba(35,20,65,0.85)' : 'rgba(14,16,28,0.85)',
                backdropFilter: 'blur(18px)',
                border: `1px solid ${saved ? 'rgba(147,51,234,0.5)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: '16px', display: 'flex', flexDirection: 'column',
                overflow: 'hidden', transition: 'all 0.25s ease',
                boxShadow: saved ? '0 0 20px rgba(147,51,234,0.2)' : '0 4px 20px rgba(0,0,0,0.3)'
              }}
            >
              {/* Accent top bar */}
              <div style={{ height: '3px', background: gradient }} />

              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', flex: 1 }}>
                {/* Top meta row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em',
                    padding: '0.2rem 0.65rem', borderRadius: '9999px',
                    background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.3)', color: '#c084fc'
                  }}>
                    {idea.highlight || `Concept ${idx + 1}`}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#34d399', whiteSpace: 'nowrap' }}>
                    <DollarSign style={{ width: 11, height: 11 }} />{idea.estimatedCost}
                  </span>
                </div>

                {/* Title + tagline */}
                <div>
                  <h4 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', lineHeight: 1.3 }}>
                    {idea.title}
                  </h4>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#a855f7', lineHeight: 1.4 }}>
                    {idea.tagline}
                  </p>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.65, flex: 1 }}>
                  {idea.description}
                </p>

                {/* DIY tip box */}
                {idea.diyTip && (
                  <div style={{
                    padding: '0.75rem', borderRadius: '10px',
                    background: 'rgba(245,158,11,0.09)', border: '1px solid rgba(245,158,11,0.22)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.35rem' }}>
                      <Lightbulb style={{ width: 12, height: 12 }} />PRO DIY BUDGET TIP
                    </div>
                    <p style={{ fontSize: '0.72rem', color: '#d97706', lineHeight: 1.55 }}>
                      {idea.diyTip}
                    </p>
                  </div>
                )}
              </div>

              {/* Action footer */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)'
              }}>
                <button
                  onClick={() => handleCopy(idea)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, color: copied ? '#6ee7b7' : '#64748b', transition: 'color 0.2s' }}
                >
                  {copied ? <><Check style={{ width: 13, height: 13 }} />Copied!</> : <><Copy style={{ width: 13, height: 13 }} />Copy</>}
                </button>
                <button
                  onClick={() => handleSave(idea.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.85rem',
                    borderRadius: '9999px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.2s',
                    background: saved ? 'rgba(147,51,234,0.25)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${saved ? 'rgba(147,51,234,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    color: saved ? '#c084fc' : '#64748b'
                  }}
                >
                  <BookmarkCheck style={{ width: 13, height: 13 }} />
                  {saved ? 'Saved' : 'Save Idea'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
