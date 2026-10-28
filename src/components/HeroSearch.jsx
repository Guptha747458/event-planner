import React, { useState } from 'react';
import { Sparkles, Calendar, Users, DollarSign, MapPin, Palette, ArrowRight, Wand2 } from 'lucide-react';

const EVENT_PRESETS = [
  {
    label: '💍 Wedding',
    type: 'Wedding',
    prompt: 'A romantic rustic garden wedding for 100 guests in Austin with $25,000 budget',
    budget: 25000,
    guests: 100,
    city: 'Austin, TX',
    style: 'Rustic Bohemian',
    gradient: 'linear-gradient(135deg, #f9a8d4, #c084fc)'
  },
  {
    label: '🎂 Birthday Party',
    type: 'Birthday',
    prompt: 'A chic rooftop 30th birthday cocktail lounge party for 45 guests with $6,000 budget',
    budget: 6000,
    guests: 45,
    city: 'Los Angeles, CA',
    style: 'Neon Cyberpunk / Modern Luxe',
    gradient: 'linear-gradient(135deg, #fdba74, #f87171)'
  },
  {
    label: '🎪 Community Event',
    type: 'Community Event',
    prompt: 'A neighborhood outdoor artisan food & music festival for 250 neighbors with $12,000 budget',
    budget: 12000,
    guests: 250,
    city: 'Seattle, WA',
    style: 'Artisan Eco-Festival',
    gradient: 'linear-gradient(135deg, #6ee7b7, #22d3ee)'
  }
];

const DETAIL_FIELDS = [
  { key: 'eventType', label: 'Event Category', icon: Sparkles, color: '#c084fc', type: 'select', options: ['Wedding', 'Birthday', 'Community Event', 'Corporate Gala'] },
  { key: 'date', label: 'Target Date', icon: Calendar, color: '#f472b6', type: 'date' },
  { key: 'guestCount', label: 'Guest Count', icon: Users, color: '#22d3ee', type: 'number', min: 5, max: 5000 },
  { key: 'totalBudget', label: 'Total Budget ($)', icon: DollarSign, color: '#34d399', type: 'number', min: 500, step: 500 },
  { key: 'city', label: 'City / Location', icon: MapPin, color: '#fbbf24', type: 'text', placeholder: 'e.g. San Francisco, CA' },
  { key: 'stylePreference', label: 'Style & Aesthetic', icon: Palette, color: '#a78bfa', type: 'text', placeholder: 'e.g. Rustic Elegance, Cyberpunk' }
];

export default function HeroSearch({ onGeneratePlan, isLoading }) {
  const [nlQuery, setNlQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [activePreset, setActivePreset] = useState(null);

  const [form, setForm] = useState({
    eventType: 'Wedding',
    date: '2026-10-15',
    guestCount: 100,
    totalBudget: 15000,
    city: 'Austin, TX',
    stylePreference: 'Rustic Elegance'
  });

  const setField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSelectPreset = (preset, idx) => {
    setNlQuery(preset.prompt);
    setActivePreset(idx);
    setForm(prev => ({
      ...prev,
      eventType: preset.type,
      totalBudget: preset.budget,
      guestCount: preset.guests,
      city: preset.city,
      stylePreference: preset.style
    }));
    setShowDetails(true);
  };

  const handleQueryChange = (val) => {
    setNlQuery(val);
    const lower = val.toLowerCase();
    if (lower.includes('wedding')) setField('eventType', 'Wedding');
    else if (lower.includes('birthday')) setField('eventType', 'Birthday');
    else if (lower.includes('community') || lower.includes('festival')) setField('eventType', 'Community Event');

    const kMatch = val.match(/\$?\s*(\d+(?:\.\d+)?)\s*k/i);
    if (kMatch) setField('totalBudget', parseFloat(kMatch[1]) * 1000);
    else {
      const dMatch = val.match(/\$\s*(\d[\d,]*)/);
      if (dMatch) setField('totalBudget', parseInt(dMatch[1].replace(/,/g, ''), 10));
    }
    const gMatch = val.match(/(\d+)\s*(?:guests|people|attendees|pax|friends|neighbors)/i);
    if (gMatch) setField('guestCount', parseInt(gMatch[1], 10));
    const cityMatch = val.match(/in\s+([A-Z][a-zA-Z\s]+(?:,\s*[A-Z]{2})?)/);
    if (cityMatch) setField('city', cityMatch[1].trim());
    if (lower.includes('rustic')) setField('stylePreference', 'Rustic Bohemian');
    else if (lower.includes('modern')) setField('stylePreference', 'Modern Minimalist');
    else if (lower.includes('glam') || lower.includes('luxury')) setField('stylePreference', 'Luxury Glamour');
    else if (lower.includes('retro') || lower.includes('vintage')) setField('stylePreference', 'Vintage Retro');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGeneratePlan({
      ...form,
      guestCount: Number(form.guestCount),
      totalBudget: Number(form.totalBudget),
      naturalLanguagePrompt: nlQuery
    });
  };

  return (
    <div style={{ position: 'relative', padding: '3rem 1rem 5rem', maxWidth: '56rem', margin: '0 auto' }}>
      {/* Ambient Glow */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '700px', height: '400px', pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at center, rgba(147,51,234,0.12) 0%, rgba(236,72,153,0.06) 50%, transparent 70%)',
        filter: 'blur(40px)', borderRadius: '50%'
      }} />

      {/* Hero Text */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', position: 'relative', zIndex: 1 }}>
        {/* Pill badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 1rem', borderRadius: '9999px', marginBottom: '1.5rem',
          background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.3)',
          fontSize: '0.75rem', fontWeight: 600, color: '#c084fc', letterSpacing: '0.03em'
        }}>
          <Sparkles style={{ width: '13px', height: '13px', color: '#a855f7' }} />
          Powered by Google Gemini 2.5 Flash + Function Calling
        </div>

        <h1 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em',
          color: '#ffffff', marginBottom: '0.5rem'
        }}>
          Plan Unforgettable Events
        </h1>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
          fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #f472b6 0%, #c084fc 50%, #60a5fa 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '1.25rem'
        }}>
          With Generative Intelligence
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '38rem', margin: '0 auto', lineHeight: 1.65 }}>
          Describe your vision and get a complete plan—budget, timeline, vendors, and curated ideas—in seconds.
        </p>
      </div>

      {/* Main Search Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: 'rgba(16, 18, 30, 0.88)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
        padding: '2rem', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(147,51,234,0.1)'
      }}>
        <form onSubmit={handleSubmit}>
          {/* === Primary Input === */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.6rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              What are you planning?
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="nl-prompt"
                type="text"
                value={nlQuery}
                onChange={e => handleQueryChange(e.target.value)}
                placeholder="e.g., Rustic garden wedding for 100 guests in Austin with $20,000 budget"
                style={{
                  width: '100%', padding: '1rem 3rem 1rem 1.25rem',
                  fontSize: '1rem', fontWeight: 400, color: '#f1f5f9',
                  background: '#080a14', border: '1.5px solid rgba(255,255,255,0.12)',
                  borderRadius: '14px', outline: 'none',
                  boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.4)',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={e => { e.target.style.borderColor = '#9333ea'; e.target.style.boxShadow = '0 0 0 3px rgba(147,51,234,0.2), inset 0 2px 8px rgba(0,0,0,0.4)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'inset 0 2px 8px rgba(0,0,0,0.4)'; }}
              />
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  padding: '0.4rem', borderRadius: '8px', background: 'rgba(147,51,234,0.15)',
                  border: '1px solid rgba(147,51,234,0.3)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s'
                }}
                title="Toggle parameters"
              >
                <Wand2 style={{ width: '16px', height: '16px', color: '#c084fc' }} />
              </button>
            </div>
          </div>

          {/* === Quick-Select Chips === */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '0.25rem' }}>
              Quick select:
            </span>
            {EVENT_PRESETS.map((preset, idx) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleSelectPreset(preset, idx)}
                style={{
                  padding: '0.45rem 1rem', borderRadius: '9999px', cursor: 'pointer',
                  fontSize: '0.82rem', fontWeight: 600,
                  background: activePreset === idx ? 'rgba(147,51,234,0.25)' : 'rgba(255,255,255,0.05)',
                  border: activePreset === idx ? '1px solid rgba(147,51,234,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  color: activePreset === idx ? '#e9d5ff' : '#cbd5e1',
                  boxShadow: activePreset === idx ? '0 0 12px rgba(147,51,234,0.25)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              style={{
                marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600,
                color: '#a855f7', background: 'none', border: 'none', cursor: 'pointer',
                textDecoration: 'underline', padding: 0
              }}
            >
              {showDetails ? 'Hide Parameters ▲' : 'Customize Parameters ▼'}
            </button>
          </div>

          {/* === Expandable Detail Grid === */}
          {showDetails && (
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem', padding: '1.25rem', marginBottom: '1.25rem',
              background: 'rgba(255,255,255,0.03)', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.07)'
            }}>
              {DETAIL_FIELDS.map(field => {
                const Icon = field.icon;
                return (
                  <div key={field.key}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      fontSize: '0.72rem', fontWeight: 700, color: '#64748b',
                      textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.45rem'
                    }}>
                      <Icon style={{ width: '11px', height: '11px', color: field.color }} />
                      {field.label}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={form[field.key]}
                        onChange={e => setField(field.key, e.target.value)}
                        style={{
                          width: '100%', padding: '0.55rem 0.85rem',
                          background: '#080a14', border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '10px', fontSize: '0.83rem', color: '#f1f5f9'
                        }}
                      >
                        {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        value={form[field.key]}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        placeholder={field.placeholder}
                        onChange={e => setField(field.key, e.target.value)}
                        style={{
                          width: '100%', padding: '0.55rem 0.85rem',
                          background: '#080a14', border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: '10px', fontSize: '0.83rem', color: '#f1f5f9'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* === Submit Button === */}
          <button
            type="submit"
            id="btn-generate-plan"
            disabled={isLoading}
            style={{
              width: '100%', padding: '1rem', borderRadius: '14px', cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: "'Outfit', sans-serif", fontSize: '1.05rem', fontWeight: 700,
              color: '#ffffff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              background: isLoading ? 'rgba(147,51,234,0.4)' : 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
              boxShadow: isLoading ? 'none' : '0 4px 24px rgba(147,51,234,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
              transition: 'all 0.2s ease', opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={e => { if (!isLoading) { e.currentTarget.style.background = 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(147,51,234,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}}
            onMouseLeave={e => { if (!isLoading) { e.currentTarget.style.background = 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(147,51,234,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}}
          >
            {isLoading ? (
              <>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />
                Synthesizing Your Event Plan with Gemini...
              </>
            ) : (
              <>
                <Sparkles style={{ width: '18px', height: '18px' }} />
                Generate Full Event Plan
                <ArrowRight style={{ width: '18px', height: '18px' }} />
              </>
            )}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
