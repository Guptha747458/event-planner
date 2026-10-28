import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, AlertCircle, Layers, PieChart } from 'lucide-react';

const CATS = {
  venue:       { label: 'Venue & Location',     color: '#8b5cf6', icon: '🏛️' },
  catering:    { label: 'Catering & Drinks',    color: '#ec4899', icon: '🍽️' },
  decor:       { label: 'Decor & Florals',      color: '#10b981', icon: '💐' },
  photography: { label: 'Photography & Film',   color: '#06b6d4', icon: '📷' },
  attire:      { label: 'Attire & Styling',     color: '#f59e0b', icon: '👗' },
  misc:        { label: 'Entertainment & Misc', color: '#6366f1', icon: '🎉' }
};

export default function BudgetModule({ budget, totalBudget, onUpdateBudget, onRefineBudget, isRefining }) {
  const [instruction, setInstruction] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const categories = Object.keys(CATS);
  const totalAllocated = categories.reduce((s, k) => s + Number(budget[k] || 0), 0);
  const remaining = totalBudget - totalAllocated;

  const handleSlider = (cat, val) => onUpdateBudget({ ...budget, [cat]: Math.max(0, parseInt(val) || 0) });
  const handleNumInput = (cat, val) => onUpdateBudget({ ...budget, [cat]: Math.max(0, parseInt(val) || 0) });

  const handleRefine = async (e) => {
    e.preventDefault();
    if (!instruction.trim()) return;
    setFeedback({ type: 'loading', msg: 'Gemini is recalculating allocations…' });
    try {
      await onRefineBudget(instruction);
      setFeedback({ type: 'success', msg: `Budget adjusted: "${instruction}"` });
      setInstruction('');
      setTimeout(() => setFeedback(null), 5000);
    } catch {
      setFeedback({ type: 'error', msg: 'Refinement failed — try a different prompt.' });
    }
  };

  /* ── SVG Donut ── */
  let acc = 0;
  const slices = categories.map(k => {
    const amt = Number(budget[k] || 0);
    const pct = totalAllocated > 0 ? amt / totalAllocated : 0;
    const deg = pct * 360;
    const start = acc;
    acc += deg;
    const toXY = (a, r = 80, cx = 100, cy = 100) => {
      const rad = ((a - 90) * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };
    const s = toXY(start), f = toXY(acc);
    const large = deg > 180 ? 1 : 0;
    return { key: k, amt, pct: Math.round(pct * 100), color: CATS[k].color,
      path: pct >= 0.999 ? 'M 100 20 A 80 80 0 1 1 99.99 20' : `M ${s.x} ${s.y} A 80 80 0 ${large} 1 ${f.x} ${f.y}` };
  });

  const card = {
    background: 'rgba(14,16,28,0.85)', backdropFilter: 'blur(18px)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem'
  };
  const inputStyle = {
    background: '#080a14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
    color: '#f1f5f9', padding: '0.55rem 0.85rem', fontSize: '0.82rem', width: '100%', outline: 'none'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* AI Refiner Bar */}
      <div style={{ ...card, border: '1px solid rgba(147,51,234,0.25)', background: 'rgba(40,20,70,0.5)' }}>
        <form onSubmit={handleRefine}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Wand2 style={{ width: 15, height: 15, color: '#a855f7' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#c084fc' }}>AI Budget Refiner (Google Gemini)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <input
              id="input-refine-budget"
              type="text"
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              placeholder='e.g., "Cut catering by 20% and move to decor"'
              style={inputStyle}
              onFocus={e => { e.target.style.borderColor = '#9333ea'; e.target.style.boxShadow = '0 0 0 3px rgba(147,51,234,0.18)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none'; }}
            />
            <button
              type="submit"
              id="btn-refine-budget"
              disabled={isRefining || !instruction.trim()}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
                padding: '0.6rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700,
                fontSize: '0.82rem', border: 'none', color: '#fff', alignSelf: 'flex-start',
                background: (isRefining || !instruction.trim()) ? 'rgba(147,51,234,0.3)' : 'linear-gradient(135deg,#9333ea,#7c3aed)',
                opacity: (isRefining || !instruction.trim()) ? 0.6 : 1
              }}
            >
              {isRefining ? <><RefreshCw style={{ width: 14, height: 14 }} />Refining…</> : <><Sparkles style={{ width: 14, height: 14 }} />Refine Budget</>}
            </button>
          </div>
        </form>
        {feedback && (
          <div style={{
            marginTop: '0.75rem', fontSize: '0.75rem', padding: '0.5rem 0.85rem', borderRadius: '8px',
            background: feedback.type === 'success' ? 'rgba(16,185,129,0.15)' : feedback.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(147,51,234,0.15)',
            color: feedback.type === 'success' ? '#6ee7b7' : feedback.type === 'error' ? '#fca5a5' : '#c084fc',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(16,185,129,0.3)' : feedback.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(147,51,234,0.3)'}`
          }}>
            {feedback.msg}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

        {/* Donut Chart Panel */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }}>
            <PieChart style={{ width: 17, height: 17, color: '#a855f7' }} />
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>Allocation Overview</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
              Target ${totalBudget.toLocaleString()}
            </span>
          </div>

          {/* SVG Donut */}
          <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto 1.25rem' }}>
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="24" />
              {slices.map(sl => (
                <path
                  key={sl.key}
                  d={sl.path}
                  fill="none"
                  stroke={sl.color}
                  strokeWidth="26"
                  strokeLinecap="round"
                  style={{
                    opacity: activeCategory && activeCategory !== sl.key ? 0.35 : 1,
                    filter: activeCategory === sl.key ? `drop-shadow(0 0 8px ${sl.color})` : 'none',
                    transition: 'opacity 0.2s, filter 0.2s', cursor: 'pointer'
                  }}
                  onMouseEnter={() => setActiveCategory(sl.key)}
                  onMouseLeave={() => setActiveCategory(null)}
                />
              ))}
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>
                {activeCategory ? CATS[activeCategory].label : 'Total Allocated'}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit',sans-serif", lineHeight: 1.2 }}>
                ${(activeCategory ? Number(budget[activeCategory] || 0) : totalAllocated).toLocaleString()}
              </span>
              <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 700 }}>
                {activeCategory
                  ? `${Math.round(((budget[activeCategory] || 0) / (totalAllocated || 1)) * 100)}%`
                  : `${Math.round((totalAllocated / totalBudget) * 100)}% assigned`}
              </span>
            </div>
          </div>

          {/* Remaining / Over alert */}
          {remaining !== 0 && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.75rem', borderRadius: '10px', fontSize: '0.75rem',
              background: remaining < 0 ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${remaining < 0 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
              color: remaining < 0 ? '#fca5a5' : '#fcd34d'
            }}>
              <AlertCircle style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }} />
              <div>
                <strong>{remaining < 0 ? `Over budget by $${Math.abs(remaining).toLocaleString()}` : `Buffer: $${remaining.toLocaleString()} unallocated`}</strong>
              </div>
            </div>
          )}

          {/* Legend */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
            {categories.map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: CATS[k].color, flexShrink: 0 }} />
                {CATS[k].label.split(' ')[0]}
              </div>
            ))}
          </div>
        </div>

        {/* Slider Panel */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.25rem' }}>
            <Layers style={{ width: 17, height: 17, color: '#a855f7' }} />
            <span style={{ fontFamily: "'Outfit',sans-serif", fontWeight: 700, fontSize: '1.05rem', color: '#fff' }}>Drag-to-Adjust Sliders</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {categories.map(cat => {
              const cfg = CATS[cat];
              const amt = Number(budget[cat] || 0);
              const pct = totalBudget > 0 ? Math.round((amt / totalBudget) * 100) : 0;
              const isActive = activeCategory === cat;
              return (
                <div
                  key={cat}
                  onMouseEnter={() => setActiveCategory(cat)}
                  onMouseLeave={() => setActiveCategory(null)}
                  style={{
                    padding: '0.85rem 1rem', borderRadius: '12px', transition: 'all 0.2s',
                    background: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)',
                    border: `1px solid ${isActive ? cfg.color + '55' : 'rgba(255,255,255,0.05)'}`
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem' }}>{cfg.icon}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>{cfg.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', color: '#64748b' }}>
                        {pct}%
                      </span>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <span style={{ position: 'absolute', left: '0.6rem', fontSize: '0.72rem', color: '#64748b', pointerEvents: 'none' }}>$</span>
                        <input
                          type="number"
                          value={amt}
                          onChange={e => handleNumInput(cat, e.target.value)}
                          style={{
                            width: '90px', background: '#080a14', border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '8px', padding: '0.35rem 0.5rem 0.35rem 1.25rem',
                            fontSize: '0.8rem', fontWeight: 700, color: '#f1f5f9', textAlign: 'right', outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(totalBudget, amt * 1.5)}
                    step="50"
                    value={amt}
                    onChange={e => handleSlider(cat, e.target.value)}
                    style={{ width: '100%', accentColor: cfg.color, cursor: 'pointer', height: '4px', background: `linear-gradient(to right, ${cfg.color} ${pct}%, rgba(255,255,255,0.1) ${pct}%)` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
