import React, { useState } from 'react';
import { DollarSign, Users, Clock, Lightbulb, Edit3, Calendar, MapPin, Share2, Printer } from 'lucide-react';
import BudgetModule from './BudgetModule.jsx';
import TimelineModule from './TimelineModule.jsx';
import VendorsModule from './VendorsModule.jsx';
import IdeasModule from './IdeasModule.jsx';

const TABS = [
  { id: 'budget',   label: 'Budget Tracker',       icon: DollarSign },
  { id: 'timeline', label: 'Timeline Milestones',   icon: Clock      },
  { id: 'vendors',  label: 'Vendor Checklist',      icon: Users      },
  { id: 'ideas',    label: 'Surprise Me Ideas',     icon: Lightbulb  }
];

export default function PlanningDashboard({
  plan, onUpdatePlan, onRefineBudget, isRefiningBudget,
  onRegenerateIdeas, isRegeneratingIdeas, onEditMetadata, onOpenExport, onOpenShare
}) {
  const [activeTab, setActiveTab] = useState('budget');
  const { metadata = {}, budget = {}, timeline = [], vendors = [], ideas = [] } = plan || {};
  const totalBudget = Number(metadata.totalBudget) || 15000;
  const completedTasks = timeline.filter(t => t.completed).length;
  const bookedVendors  = vendors.filter(v => v.status === 'Booked' || v.status === 'Deposit Paid').length;

  const tabCounts = {
    budget:   `$${totalBudget.toLocaleString()}`,
    timeline: `${completedTasks}/${timeline.length}`,
    vendors:  `${bookedVendors}/${vendors.length}`,
    ideas:    `${ideas.length} Ideas`
  };

  const s = {
    page:   { maxWidth: '80rem', margin: '0 auto', padding: '2rem 1rem 4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    banner: {
      background: 'rgba(22,16,48,0.75)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(147,51,234,0.18)', borderRadius: '18px', padding: '1.5rem 2rem',
      display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.25rem'
    },
    chip: (color) => ({
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700,
      background: `${color}18`, border: `1px solid ${color}40`, color
    }),
    actionBtn: {
      display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
      borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8'
    },
    primaryBtn: {
      display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1.25rem',
      borderRadius: '10px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
      background: 'linear-gradient(135deg, #9333ea, #7c3aed)', border: 'none', color: '#fff',
      boxShadow: '0 4px 14px rgba(147,51,234,0.4)'
    },
    tabBar: {
      display: 'flex', overflowX: 'auto', gap: '0.25rem',
      borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0'
    }
  };

  return (
    <div style={s.page}>
      {/* Event Overview Banner */}
      <div style={s.banner}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span style={s.chip('#c084fc')}>{metadata.eventType || 'Event'} Plan</span>
            <span style={s.chip('#fbbf24')}><MapPin style={{ width: 10, height: 10 }} />{metadata.city || 'Location'}</span>
            <span style={s.chip('#f472b6')}><Calendar style={{ width: 10, height: 10 }} />{metadata.date || 'Target Date'}</span>
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            {metadata.stylePreference || 'Curated'} {metadata.eventType || 'Event'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Planning for <strong style={{ color: '#e2e8f0' }}>{metadata.guestCount || 100} guests</strong> · Budget{' '}
            <strong style={{ color: '#34d399' }}>${totalBudget.toLocaleString()}</strong>
          </p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
          <button style={s.actionBtn} onClick={onEditMetadata}><Edit3 style={{ width: 14, height: 14, color: '#c084fc' }} />Edit Details</button>
          <button style={s.actionBtn} onClick={onOpenShare}><Share2 style={{ width: 14, height: 14, color: '#22d3ee' }} />Share</button>
          <button style={s.primaryBtn} onClick={onOpenExport}><Printer style={{ width: 14, height: 14 }} />Export Plan</button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={s.tabBar}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.25rem', cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.82rem', fontWeight: active ? 700 : 500,
                background: active ? 'rgba(147,51,234,0.1)' : 'transparent',
                border: 'none', borderBottom: active ? '2px solid #9333ea' : '2px solid transparent',
                color: active ? '#e9d5ff' : '#64748b',
                borderRadius: '8px 8px 0 0', transition: 'all 0.18s ease'
              }}
            >
              <Icon style={{ width: 15, height: 15, color: active ? '#a855f7' : '#475569' }} />
              <span>{tab.label}</span>
              <span style={{
                padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700,
                background: active ? 'rgba(147,51,234,0.25)' : 'rgba(255,255,255,0.05)',
                color: active ? '#c084fc' : '#475569'
              }}>
                {tabCounts[tab.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Module Content */}
      <div style={{ marginTop: '0.5rem' }}>
        {activeTab === 'budget'   && <BudgetModule   budget={budget} totalBudget={totalBudget} onUpdateBudget={b => onUpdatePlan({ ...plan, budget: b })} onRefineBudget={onRefineBudget} isRefining={isRefiningBudget} />}
        {activeTab === 'timeline' && <TimelineModule  timeline={timeline} onUpdateTimeline={t => onUpdatePlan({ ...plan, timeline: t })} eventDate={metadata.date} />}
        {activeTab === 'vendors'  && <VendorsModule   vendors={vendors} onUpdateVendors={v => onUpdatePlan({ ...plan, vendors: v })} totalBudget={totalBudget} />}
        {activeTab === 'ideas'    && <IdeasModule     ideas={ideas} onRegenerateIdeas={onRegenerateIdeas} isRegenerating={isRegeneratingIdeas} metadata={metadata} />}
      </div>
    </div>
  );
}
