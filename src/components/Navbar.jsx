import React from 'react';
import { Sparkles, Share2, Printer, PlusCircle } from 'lucide-react';

export default function Navbar({ onNewPlan, onExport, onShare, currentPlan }) {
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
        <div
          onClick={onNewPlan}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, #7c3aed, #9333ea, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(147,51,234,0.45)'
          }}>
            <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                fontFamily: "'Outfit', sans-serif", fontWeight: 800,
                fontSize: '1.2rem', letterSpacing: '-0.02em', color: '#ffffff'
              }}>
                Aura<span style={{ color: '#c084fc' }}>Plan</span>
              </span>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                padding: '0.2rem 0.55rem', borderRadius: '9999px',
                background: 'rgba(147,51,234,0.18)', color: '#c084fc', border: '1px solid rgba(147,51,234,0.35)'
              }}>
                Gemini GenAI
              </span>
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
        </div>
      </div>
    </header>
  );
}
