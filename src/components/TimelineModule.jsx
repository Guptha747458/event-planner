import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Plus, Flag } from 'lucide-react';

const PRIORITY = {
  Critical: { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.35)',  text: '#fca5a5' },
  High:     { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)', text: '#fcd34d' },
  Medium:   { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.35)', text: '#93c5fd' },
  Low:      { bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)', text: '#94a3b8' }
};
const PHASE_ORDER = ['Today','6 Months Out','5 Months Out','4 Months Out','3 Months Out','2 Months Out','1 Month Out','1 Week Out','Event Day'];

export default function TimelineModule({ timeline, onUpdateTimeline, eventDate }) {
  const [filterPriority, setFilterPriority]   = useState('All');
  const [filterStatus,   setFilterStatus]     = useState('All');
  const [showAddModal,   setShowAddModal]     = useState(false);
  const [newTask, setNewTask] = useState({ title: '', phase: '3 Months Out', priority: 'Medium', notes: '' });

  const total     = (timeline || []).length;
  const completed = (timeline || []).filter(t => t.completed).length;
  const progress  = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filtered = (timeline || []).filter(t => {
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterStatus === 'Pending'   && t.completed)  return false;
    if (filterStatus === 'Completed' && !t.completed) return false;
    return true;
  });

  const grouped = {};
  filtered.forEach(t => { const p = t.phase || 'General'; if (!grouped[p]) grouped[p] = []; grouped[p].push(t); });
  const sortedPhases = Object.keys(grouped).sort((a, b) => {
    const ia = PHASE_ORDER.indexOf(a), ib = PHASE_ORDER.indexOf(b);
    return ia !== -1 && ib !== -1 ? ia - ib : ia !== -1 ? -1 : ib !== -1 ? 1 : a.localeCompare(b);
  });

  const handleToggle = id => onUpdateTimeline(timeline.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const handleDelete = id => onUpdateTimeline(timeline.filter(t => t.id !== id));
  const handleAdd    = e => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    onUpdateTimeline([...timeline, { id: `task-custom-${Date.now()}`, ...newTask, completed: false, dueDate: newTask.phase }]);
    setNewTask({ title: '', phase: '3 Months Out', priority: 'Medium', notes: '' });
    setShowAddModal(false);
  };

  const card = { background: 'rgba(14,16,28,0.85)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' };
  const inputStyle = { background: '#080a14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#f1f5f9', padding: '0.5rem 0.75rem', fontSize: '0.8rem', outline: 'none', width: '100%' };
  const filterBtn = (active, label, onClick) => (
    <button key={label} onClick={onClick} style={{
      padding: '0.3rem 0.8rem', borderRadius: '9999px', cursor: 'pointer',
      fontSize: '0.72rem', fontWeight: 600, border: 'none',
      background: active ? 'rgba(147,51,234,0.3)' : 'rgba(255,255,255,0.05)',
      color: active ? '#e9d5ff' : '#64748b', transition: 'all 0.15s'
    }}>
      {label}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header Panel */}
      <div style={card}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock style={{ width: 18, height: 18, color: '#a855f7' }} />
              Milestone & Task Timeline
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Phased roadmap from today leading to event day ({eventDate || 'Target Date'}).
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem',
              borderRadius: '10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
              background: 'linear-gradient(135deg,#9333ea,#7c3aed)', border: 'none', color: '#fff',
              boxShadow: '0 4px 12px rgba(147,51,234,0.4)'
            }}
          >
            <Plus style={{ width: 14, height: 14 }} />Add Milestone
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            <span style={{ color: '#94a3b8' }}>Completed: <span style={{ color: '#c084fc' }}>{completed}</span> of {total}</span>
            <span style={{ color: '#c084fc' }}>{progress}% Ready</span>
          </div>
          <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, borderRadius: '9999px', background: 'linear-gradient(to right,#9333ea,#ec4899,#22d3ee)', transition: 'width 0.4s ease' }} />
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {['All','Pending','Completed'].map(s => filterBtn(filterStatus === s, s, () => setFilterStatus(s)))}
          <span style={{ color: 'rgba(255,255,255,0.15)', margin: '0 0.25rem' }}>|</span>
          {['All','Critical','High','Medium','Low'].map(p => filterBtn(filterPriority === p, p, () => setFilterPriority(p)))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={{ ...card, border: '1px solid rgba(147,51,234,0.3)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>Add New Milestone</h4>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <input type="text" placeholder="Task title…" value={newTask.title}
                onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))} style={inputStyle} required />
            </div>
            <select value={newTask.phase} onChange={e => setNewTask(p => ({ ...p, phase: e.target.value }))} style={inputStyle}>
              {PHASE_ORDER.map(ph => <option key={ph} value={ph}>{ph}</option>)}
            </select>
            <select value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))} style={inputStyle}>
              {['Critical','High','Medium','Low'].map(pr => <option key={pr} value={pr}>{pr} Priority</option>)}
            </select>
            <div style={{ gridColumn: '1 / -1' }}>
              <input type="text" placeholder="Notes…" value={newTask.notes}
                onChange={e => setNewTask(p => ({ ...p, notes: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.6rem' }}>
              <button type="submit" style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', background: 'linear-gradient(135deg,#9333ea,#7c3aed)', border: 'none', color: '#fff' }}>Add Task</button>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Vertical Roadmap */}
      <div style={{ position: 'relative', paddingLeft: '1.75rem' }}>
        {/* Timeline line */}
        <div style={{ position: 'absolute', left: '6px', top: '8px', bottom: '8px', width: '2px', background: 'linear-gradient(to bottom, #9333ea, #ec4899, #22d3ee)', borderRadius: '2px', opacity: 0.5 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {sortedPhases.map(phase => (
            <div key={phase}>
              {/* Phase Dot + Label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: '-1.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#0a0c18', border: '2px solid #9333ea', boxShadow: '0 0 8px rgba(147,51,234,0.5)', flexShrink: 0 }} />
                <span style={{
                  fontFamily: "'Outfit',sans-serif", fontWeight: 800, fontSize: '0.75rem',
                  textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c084fc',
                  padding: '0.2rem 0.75rem', borderRadius: '9999px',
                  background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.25)'
                }}>
                  {phase}
                </span>
              </div>

              {/* Tasks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {grouped[phase].map(task => {
                  const pr = PRIORITY[task.priority] || PRIORITY.Low;
                  return (
                    <div key={task.id} style={{
                      background: task.completed ? 'rgba(255,255,255,0.02)' : 'rgba(14,16,28,0.8)',
                      border: `1px solid ${task.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '12px', padding: '1rem 1.1rem',
                      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem',
                      opacity: task.completed ? 0.65 : 1, transition: 'all 0.2s'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                        <button onClick={() => handleToggle(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '1px', flexShrink: 0 }}>
                          {task.completed
                            ? <CheckCircle2 style={{ width: 20, height: 20, color: '#34d399' }} />
                            : <Circle style={{ width: 20, height: 20, color: '#334155' }} />}
                        </button>
                        <div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: task.completed ? '#64748b' : '#e2e8f0', textDecoration: task.completed ? 'line-through' : 'none' }}>
                              {task.title}
                            </span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.68rem', fontWeight: 700, background: pr.bg, border: `1px solid ${pr.border}`, color: pr.text }}>
                              <Flag style={{ width: 9, height: 9 }} />{task.priority}
                            </span>
                            {task.category && <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', padding: '0.12rem 0.5rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', color: '#475569', letterSpacing: '0.04em' }}>{task.category}</span>}
                          </div>
                          {task.notes && <p style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.5 }}>{task.notes}</p>}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', fontSize: '0.75rem', padding: '0.2rem 0.4rem', borderRadius: '6px', flexShrink: 0, marginTop: '-1px' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'none'; }}>
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ ...card, textAlign: 'center', color: '#475569', fontSize: '0.85rem', padding: '2.5rem' }}>
              No milestones match the active filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
