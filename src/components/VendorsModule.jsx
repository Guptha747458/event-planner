import React, { useState } from 'react';
import { Users, Plus, Mail, Trash2 } from 'lucide-react';

const STATUS_LIST = [
  { key: 'Not Contacted', color: '#64748b', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.25)' },
  { key: 'Reached Out',   color: '#fbbf24', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  { key: 'Booked',        color: '#34d399', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  { key: 'Deposit Paid',  color: '#c084fc', bg: 'rgba(147,51,234,0.15)',  border: 'rgba(147,51,234,0.35)' }
];

const CATEGORIES = ['Venue','Caterer','Photographer','Florist','DJ/Band','Officiant','Rentals','Other'];

const emptyForm = { category: 'Venue', name: '', estimatedCost: '', actualCost: '', status: 'Not Contacted', contact: '', notes: '' };

export default function VendorsModule({ vendors, onUpdateVendors, totalBudget }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const setField = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const handleCycleStatus = id => {
    onUpdateVendors(vendors.map(v => {
      if (v.id !== id) return v;
      const idx = STATUS_LIST.findIndex(s => s.key === v.status);
      return { ...v, status: STATUS_LIST[(idx + 1) % STATUS_LIST.length].key };
    }));
  };
  const handleNoteChange  = (id, notes)  => onUpdateVendors(vendors.map(v => v.id === id ? { ...v, notes } : v));
  const handleCostChange  = (id, f, val) => onUpdateVendors(vendors.map(v => v.id === id ? { ...v, [f]: Math.max(0, parseInt(val) || 0) } : v));
  const handleDelete      = id => onUpdateVendors(vendors.filter(v => v.id !== id));
  const handleAdd = e => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onUpdateVendors([...vendors, { id: `v-custom-${Date.now()}`, ...form, estimatedCost: parseInt(form.estimatedCost) || 0, actualCost: parseInt(form.actualCost) || 0 }]);
    setForm(emptyForm);
    setShowForm(false);
  };

  const totalCommitted = vendors.filter(v => v.status === 'Booked' || v.status === 'Deposit Paid')
    .reduce((a, v) => a + (Number(v.actualCost) || Number(v.estimatedCost) || 0), 0);
  const bookedCount = vendors.filter(v => v.status === 'Booked' || v.status === 'Deposit Paid').length;

  const card = { background: 'rgba(14,16,28,0.85)', backdropFilter: 'blur(18px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.5rem' };
  const input = { background: '#080a14', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: '#f1f5f9', padding: '0.5rem 0.75rem', fontSize: '0.8rem', outline: 'none', width: '100%' };
  const labelStyle = { display: 'block', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', marginBottom: '0.3rem' };
  const primaryBtn = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.55rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, background: 'linear-gradient(135deg,#9333ea,#7c3aed)', border: 'none', color: '#fff', boxShadow: '0 4px 12px rgba(147,51,234,0.4)' };
  const ghostBtn  = { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header + Metrics */}
      <div style={card}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: '1.15rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users style={{ width: 18, height: 18, color: '#a855f7' }} />
              Categorized Vendor Checklist
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Track vendor outreach, status, payments, and notes in one view.
            </p>
          </div>
          <button style={primaryBtn} onClick={() => setShowForm(!showForm)}>
            <Plus style={{ width: 14, height: 14 }} />Add Vendor
          </button>
        </div>

        {/* Metric Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
          {[
            { label: 'Total Vendors',    value: `${vendors.length} Partners`, color: '#fff'    },
            { label: 'Booked / Paid',    value: `${bookedCount} Confirmed`,   color: '#34d399' },
            { label: 'Committed Spend',  value: `$${totalCommitted.toLocaleString()}`, color: '#c084fc' }
          ].map(m => (
            <div key={m.label} style={{ padding: '0.75rem 1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>{m.label}</span>
              <span style={{ fontSize: '1rem', fontFamily: "'Outfit',sans-serif", fontWeight: 800, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{ ...card, border: '1px solid rgba(147,51,234,0.3)' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.85rem' }}>Add Vendor Partner</h4>
          <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
            <div><label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => setField('category', e.target.value)} style={input}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Vendor Name *</label>
              <input type="text" placeholder="e.g. Golden Hour Photos" value={form.name} onChange={e => setField('name', e.target.value)} style={input} required />
            </div>
            <div><label style={labelStyle}>Initial Status</label>
              <select value={form.status} onChange={e => setField('status', e.target.value)} style={input}>
                {STATUS_LIST.map(s => <option key={s.key} value={s.key}>{s.key}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>Est. Cost ($)</label>
              <input type="number" placeholder="2500" value={form.estimatedCost} onChange={e => setField('estimatedCost', e.target.value)} style={input} />
            </div>
            <div><label style={labelStyle}>Contact Email / Phone</label>
              <input type="text" placeholder="hello@vendor.com" value={form.contact} onChange={e => setField('contact', e.target.value)} style={input} />
            </div>
            <div><label style={labelStyle}>Notes</label>
              <input type="text" placeholder="Package details…" value={form.notes} onChange={e => setField('notes', e.target.value)} style={input} />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.6rem', paddingTop: '0.25rem' }}>
              <button type="submit" style={primaryBtn}>Add Vendor</button>
              <button type="button" onClick={() => setShowForm(false)} style={ghostBtn}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Vendor Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {vendors.map(vendor => {
          const st = STATUS_LIST.find(s => s.key === vendor.status) || STATUS_LIST[0];
          return (
            <div key={vendor.id} style={{
              background: 'rgba(14,16,28,0.8)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '14px', padding: '1.1rem 1.25rem',
              display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: '1rem'
            }}>
              {/* Category + Name + Contact */}
              <div style={{ flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.15rem 0.6rem', borderRadius: '9999px', background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.3)', color: '#c084fc' }}>
                    {vendor.category}
                  </span>
                  <button
                    onClick={() => handleCycleStatus(vendor.id)}
                    title="Click to advance status"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.15rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', background: st.bg, border: `1px solid ${st.border}`, color: st.color }}
                  >
                    ● {st.key}
                  </button>
                </div>
                <span style={{ fontSize: '1rem', fontFamily: "'Outfit',sans-serif", fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vendor.name}</span>
                {vendor.contact && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#64748b' }}>
                    <Mail style={{ width: 11, height: 11 }} />{vendor.contact}
                  </span>
                )}
              </div>

              {/* Cost */}
              <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flex: '0 0 auto' }}>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', display: 'block', marginBottom: '0.25rem' }}>Estimated</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#94a3b8' }}>${Number(vendor.estimatedCost || 0).toLocaleString()}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', display: 'block', marginBottom: '0.2rem' }}>Actual Paid</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#475569' }}>$</span>
                    <input
                      type="number" value={vendor.actualCost || 0}
                      onChange={e => handleCostChange(vendor.id, 'actualCost', e.target.value)}
                      style={{ width: '75px', background: '#080a14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '7px', padding: '0.3rem 0.5rem', fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9', textAlign: 'right', outline: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div style={{ flex: '2 1 220px', minWidth: 0 }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#475569', display: 'block', marginBottom: '0.3rem' }}>Notes & Scope</span>
                <input
                  type="text" value={vendor.notes || ''}
                  onChange={e => handleNoteChange(vendor.id, e.target.value)}
                  placeholder="Package notes, tasting details, deposit dates…"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '0.45rem 0.75rem', fontSize: '0.78rem', color: '#94a3b8', outline: 'none' }}
                />
              </div>

              {/* Delete */}
              <button onClick={() => handleDelete(vendor.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#334155', padding: '0.3rem', borderRadius: '7px', flexShrink: 0, alignSelf: 'center', display: 'flex' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#334155'; e.currentTarget.style.background = 'none'; }}
              >
                <Trash2 style={{ width: 15, height: 15 }} />
              </button>
            </div>
          );
        })}

        {vendors.length === 0 && (
          <div style={{ ...card, textAlign: 'center', color: '#475569', fontSize: '0.85rem', padding: '2.5rem' }}>
            No vendors yet — click &ldquo;Add Vendor&rdquo; to build your directory.
          </div>
        )}
      </div>
    </div>
  );
}
