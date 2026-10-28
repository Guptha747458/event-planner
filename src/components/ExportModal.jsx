import React, { useState } from 'react';
import { X, Printer, Download, FileText, Check, Sparkles, Copy, Calendar, MapPin, Users, DollarSign, CheckCircle2, Clock } from 'lucide-react';

export default function ExportModal({ plan, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  if (!plan) return null;

  const { metadata = {}, budget = {}, timeline = [], vendors = [], ideas = [] } = plan;
  const totalBudget = Number(metadata.totalBudget) || 15000;
  const totalAllocated = Object.values(budget).reduce((a, b) => a + Number(b), 0);
  const totalVendorActual = vendors.reduce((a, b) => a + Number(b.actualCost || 0), 0);
  const totalVendorEstimated = vendors.reduce((a, b) => a + Number(b.estimatedCost || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    try {
      const rows = [];
      rows.push(['=== AURAPLAN EVENT MASTER PLAN ===']);
      rows.push(['Event Type', metadata.eventType || 'Event']);
      rows.push(['Style Preference', metadata.stylePreference || 'Curated']);
      rows.push(['City', metadata.city || 'N/A']);
      rows.push(['Date', metadata.date || 'N/A']);
      rows.push(['Guest Count', metadata.guestCount || 'N/A']);
      rows.push(['Target Total Budget ($)', totalBudget]);
      rows.push(['Total Allocated ($)', totalAllocated]);
      rows.push([]);

      rows.push(['=== 1. BUDGET ALLOCATION ===']);
      rows.push(['Category', 'Allocated ($)', 'Percentage of Total (%)']);
      Object.entries(budget).forEach(([category, amount]) => {
        const num = Number(amount) || 0;
        const pct = totalBudget > 0 ? Math.round((num / totalBudget) * 100) : 0;
        rows.push([category.toUpperCase(), num, `${pct}%`]);
      });
      rows.push(['TOTAL', totalAllocated, '100%']);
      rows.push([]);

      rows.push(['=== 2. VENDORS DIRECTORY ===']);
      rows.push(['Category', 'Partner Name', 'Status', 'Estimated Cost ($)', 'Actual Cost Paid ($)']);
      vendors.forEach(v => {
        rows.push([
          v.category || '',
          `"${(v.name || '').replace(/"/g, '""')}"`,
          v.status || '',
          v.estimatedCost || 0,
          v.actualCost || 0
        ]);
      });
      rows.push(['TOTALS', '', '', totalVendorEstimated, totalVendorActual]);
      rows.push([]);

      rows.push(['=== 3. TIMELINE MILESTONES ===']);
      rows.push(['Milestone Title', 'Phase', 'Priority', 'Status', 'Notes']);
      timeline.forEach(t => {
        rows.push([
          `"${(t.title || '').replace(/"/g, '""')}"`,
          t.phase || '',
          t.priority || '',
          t.completed ? 'Completed' : 'Pending',
          `"${(t.notes || '').replace(/"/g, '""')}"`
        ]);
      });
      rows.push([]);

      if (ideas.length > 0) {
        rows.push(['=== 4. CURATED IDEAS & DIY TIPS ===']);
        rows.push(['Concept Title', 'Description', 'DIY Tip']);
        ideas.forEach(i => {
          rows.push([
            `"${(i.title || '').replace(/"/g, '""')}"`,
            `"${(i.description || '').replace(/"/g, '""')}"`,
            `"${(i.diyTip || '').replace(/"/g, '""')}"`
          ]);
        });
      }

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      const filename = `auraplan-${(metadata.eventType || 'event').toLowerCase().replace(/\s+/g, '-')}-plan.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess('CSV Downloaded!');
      setTimeout(() => setDownloadSuccess(''), 3000);
    } catch (err) {
      console.error('CSV export failed:', err);
    }
  };

  const handleExportJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plan, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      const filename = `auraplan-${(metadata.eventType || 'event').toLowerCase().replace(/\s+/g, '-')}-plan.json`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess('JSON Exported!');
      setTimeout(() => setDownloadSuccess(''), 3000);
    } catch (err) {
      console.error('JSON export failed:', err);
    }
  };

  const handleCopySummary = () => {
    try {
      let text = `# ${metadata.stylePreference || 'Curated'} ${metadata.eventType || 'Event'} Master Plan\n\n`;
      text += `📍 Location: ${metadata.city} | 📅 Date: ${metadata.date} | 👥 Guests: ${metadata.guestCount}\n`;
      text += `💰 Target Budget: $${totalBudget.toLocaleString()} (Allocated: $${totalAllocated.toLocaleString()})\n\n`;

      text += `## 1. Budget Breakdown\n`;
      Object.entries(budget).forEach(([category, amount]) => {
        const num = Number(amount) || 0;
        const pct = totalBudget > 0 ? Math.round((num / totalBudget) * 100) : 0;
        text += `- **${category.toUpperCase()}**: $${num.toLocaleString()} (${pct}%)\n`;
      });

      text += `\n## 2. Timeline Milestones\n`;
      timeline.forEach(t => {
        text += `- [${t.completed ? 'x' : ' '}] **${t.title}** (${t.phase} • Priority: ${t.priority})\n`;
        if (t.notes) text += `  _${t.notes}_\n`;
      });

      text += `\n## 3. Vendor Directory\n`;
      vendors.forEach(v => {
        text += `- **${v.name}** [${v.category}]: ${v.status} | Est: $${v.estimatedCost || 0} | Paid: $${v.actualCost || 0}\n`;
      });

      if (ideas.length > 0) {
        text += `\n## 4. Curated Concept Ideas\n`;
        ideas.forEach(i => {
          text += `### ${i.title}\n${i.description}\n`;
          if (i.diyTip) text += `> 💡 DIY Tip: ${i.diyTip}\n\n`;
        });
      }

      text += `\n---\n*Generated by AuraPlan AI • Powered by Google Gemini*`;

      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Inline styles for guaranteed dark theme & responsiveness
  const s = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      backgroundColor: 'rgba(3, 5, 12, 0.85)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      overflowY: 'auto'
    },
    modal: {
      position: 'relative',
      width: '100%',
      maxWidth: '940px',
      maxHeight: '92vh',
      backgroundColor: '#0c0e18',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '20px',
      boxShadow: '0 25px 60px -15px rgba(0,0,0,0.9), 0 0 50px rgba(147,51,234,0.18)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    header: {
      padding: '1.25rem 1.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      backgroundColor: 'rgba(14, 17, 30, 0.95)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexShrink: 0
    },
    body: {
      padding: '1.75rem',
      overflowY: 'auto',
      flex: 1,
      color: '#e2e8f0'
    },
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      padding: '0.55rem 1.1rem',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
      color: '#ffffff',
      fontWeight: 600,
      fontSize: '0.825rem',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
      transition: 'all 0.15s ease'
    },
    btnSecondary: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.45rem',
      padding: '0.55rem 0.95rem',
      borderRadius: '10px',
      background: 'rgba(255, 255, 255, 0.06)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      color: '#f8fafc',
      fontWeight: 500,
      fontSize: '0.825rem',
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    },
    btnClose: {
      padding: '0.5rem',
      borderRadius: '8px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#94a3b8',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    sectionCard: {
      background: 'rgba(18, 22, 36, 0.7)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '14px',
      padding: '1.25rem',
      marginBottom: '1.5rem'
    },
    sectionTitle: {
      fontFamily: "'Outfit', sans-serif",
      fontSize: '1.05rem',
      fontWeight: 700,
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.8rem',
      textAlign: 'left'
    },
    th: {
      padding: '0.6rem 0.75rem',
      color: '#94a3b8',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      letterSpacing: '0.05em',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    },
    td: {
      padding: '0.7rem 0.75rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      color: '#cbd5e1'
    }
  };

  return (
    <div className="export-modal-backdrop" style={s.overlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="export-modal-dialog" style={s.modal}>
        {/* Top Controls Toolbar — Hidden in Print */}
        <div className="no-print" style={s.header}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Printer style={{ width: '16px', height: '16px', color: '#fff' }} />
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.15rem', color: '#ffffff' }}>
                Export &amp; Print Event Master Plan
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Download printable PDF, spreadsheet CSV, JSON backup, or copy structured summary.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            {downloadSuccess && (
              <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Check style={{ width: 14, height: 14 }} /> {downloadSuccess}
              </span>
            )}

            <button
              onClick={handlePrint}
              id="btn-trigger-print"
              style={s.btnPrimary}
              title="Print to printer or save as clean PDF"
            >
              <Printer style={{ width: 15, height: 15 }} />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleExportCSV}
              id="btn-export-csv"
              style={s.btnSecondary}
              title="Download CSV for Excel or Google Sheets"
            >
              <Download style={{ width: 15, height: 15, color: '#34d399' }} />
              <span>CSV Spreadsheet</span>
            </button>

            <button
              onClick={handleExportJSON}
              id="btn-export-json"
              style={s.btnSecondary}
              title="Download JSON data file"
            >
              <FileText style={{ width: 15, height: 15, color: '#60a5fa' }} />
              <span>JSON Backup</span>
            </button>

            <button
              onClick={handleCopySummary}
              id="btn-copy-summary"
              style={s.btnSecondary}
              title="Copy markdown text summary"
            >
              {copied ? (
                <>
                  <Check style={{ width: 15, height: 15, color: '#34d399' }} />
                  <span style={{ color: '#34d399' }}>Copied!</span>
                </>
              ) : (
                <>
                  <Copy style={{ width: 15, height: 15, color: '#c084fc' }} />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              style={s.btnClose}
              title="Close modal"
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY */}
        <div id="printable-summary" className="export-printable-content" style={s.body}>
          {/* Document Header Brief */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(14, 18, 32, 0.8) 100%)',
            border: '1px solid rgba(147, 51, 234, 0.25)',
            marginBottom: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem'
          }}>
            <div>
              <span className="print-accent" style={{
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#c084fc',
                fontWeight: 700,
                display: 'block',
                marginBottom: '0.25rem'
              }}>
                AuraPlan AI &bull; Executive Event Brief
              </span>
              <h1 style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.85rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.2
              }}>
                {metadata.stylePreference || 'Curated'} {metadata.eventType || 'Event'}
              </h1>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: '1rem',
                marginTop: '0.6rem',
                fontSize: '0.8rem',
                color: '#94a3b8'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin style={{ width: 14, height: 14, color: '#f472b6' }} />
                  <strong style={{ color: '#f1f5f9' }}>{metadata.city || 'City'}</strong>
                </span>
                <span>&bull;</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar style={{ width: 14, height: 14, color: '#60a5fa' }} />
                  <strong style={{ color: '#f1f5f9' }}>{metadata.date || 'Target Date'}</strong>
                </span>
                <span>&bull;</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Users style={{ width: 14, height: 14, color: '#fbbf24' }} />
                  <strong style={{ color: '#f1f5f9' }}>{metadata.guestCount || 0} Guests</strong>
                </span>
              </div>
            </div>

            <div style={{
              textAlign: 'right',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              background: 'rgba(5, 7, 15, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Target Event Budget
              </span>
              <span className="print-emerald" style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#34d399'
              }}>
                ${totalBudget.toLocaleString()}
              </span>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                Allocated: <strong style={{ color: '#cbd5e1' }}>${totalAllocated.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* 1. Financial Allocation Breakdown */}
          <div style={s.sectionCard}>
            <h3 style={s.sectionTitle}>
              <DollarSign style={{ width: 18, height: 18, color: '#34d399' }} />
              <span>1. Financial Allocation Breakdown</span>
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Category</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Allocated ($)</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>% of Total</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(budget).map(([key, val]) => {
                    const num = Number(val) || 0;
                    const pct = totalBudget > 0 ? Math.round((num / totalBudget) * 100) : 0;
                    return (
                      <tr key={key}>
                        <td style={{ ...s.td, textTransform: 'capitalize', fontWeight: 600, color: '#f1f5f9' }}>{key}</td>
                        <td style={{ ...s.td, textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>${num.toLocaleString()}</td>
                        <td style={{ ...s.td, textAlign: 'right', color: '#94a3b8' }}>{pct}%</td>
                        <td style={{ ...s.td, textAlign: 'right', width: '120px' }}>
                          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(pct, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #9333ea, #c084fc)' }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: '2px solid rgba(255, 255, 255, 0.15)', fontWeight: 700 }}>
                    <td style={{ ...s.td, color: '#ffffff', fontSize: '0.85rem' }}>Total Allocated</td>
                    <td style={{ ...s.td, textAlign: 'right', color: '#34d399', fontSize: '0.9rem' }}>${totalAllocated.toLocaleString()}</td>
                    <td style={{ ...s.td, textAlign: 'right', color: '#ffffff' }}>
                      {totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 100}%
                    </td>
                    <td style={s.td}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. Timeline Milestones */}
          <div style={s.sectionCard}>
            <h3 style={s.sectionTitle}>
              <Clock style={{ width: 18, height: 18, color: '#60a5fa' }} />
              <span>2. Timeline Milestones &amp; Checklist ({timeline.filter(t => t.completed).length}/{timeline.length} Completed)</span>
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '0.75rem' }}>
              {timeline.map((task) => (
                <div key={task.id} style={{
                  padding: '0.85rem',
                  borderRadius: '10px',
                  background: task.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: task.completed ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(255, 255, 255, 0.07)',
                  fontSize: '0.775rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <span style={{
                      fontWeight: 600,
                      color: task.completed ? '#6ee7b7' : '#ffffff',
                      textDecoration: task.completed ? 'line-through' : 'none'
                    }}>
                      {task.title}
                    </span>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      background: task.priority === 'Critical' ? 'rgba(239, 68, 68, 0.2)' :
                                  task.priority === 'High' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(148, 163, 184, 0.15)',
                      color: task.priority === 'Critical' ? '#fca5a5' :
                             task.priority === 'High' ? '#fcd34d' : '#cbd5e1'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.725rem' }}>
                    <span>Phase: {task.phase}</span>
                    <span style={{ color: task.completed ? '#34d399' : '#94a3b8' }}>
                      {task.completed ? '✓ Completed' : '○ Pending'}
                    </span>
                  </div>
                  {task.notes && (
                    <p style={{ marginTop: '0.4rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.725rem' }}>
                      {task.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Vendor Directory */}
          <div style={s.sectionCard}>
            <h3 style={s.sectionTitle}>
              <CheckCircle2 style={{ width: 18, height: 18, color: '#c084fc' }} />
              <span>3. Vendor Directory &amp; Status</span>
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Category</th>
                    <th style={s.th}>Partner Name</th>
                    <th style={s.th}>Status</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Est. Cost ($)</th>
                    <th style={{ ...s.th, textAlign: 'right' }}>Actual Paid ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.id}>
                      <td style={{ ...s.td, fontWeight: 500, color: '#94a3b8' }}>{v.category}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: '#f8fafc' }}>{v.name}</td>
                      <td style={s.td}>
                        <span style={{
                          padding: '0.2rem 0.55rem',
                          borderRadius: '9999px',
                          fontSize: '0.675rem',
                          fontWeight: 600,
                          background: v.status === 'Booked' ? 'rgba(16, 185, 129, 0.15)' :
                                      v.status === 'Deposit Paid' ? 'rgba(147, 51, 234, 0.2)' :
                                      v.status === 'Reached Out' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                          color: v.status === 'Booked' ? '#34d399' :
                                 v.status === 'Deposit Paid' ? '#c084fc' :
                                 v.status === 'Reached Out' ? '#fbbf24' : '#94a3b8',
                          border: '1px solid rgba(255, 255, 255, 0.08)'
                        }}>
                          {v.status}
                        </span>
                      </td>
                      <td style={{ ...s.td, textAlign: 'right', color: '#94a3b8' }}>
                        ${Number(v.estimatedCost || 0).toLocaleString()}
                      </td>
                      <td style={{ ...s.td, textAlign: 'right', fontWeight: 600, color: '#f8fafc' }}>
                        ${Number(v.actualCost || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid rgba(255, 255, 255, 0.12)', fontWeight: 700 }}>
                    <td style={{ ...s.td, color: '#ffffff' }} colSpan={3}>Vendor Totals</td>
                    <td style={{ ...s.td, textAlign: 'right', color: '#94a3b8' }}>${totalVendorEstimated.toLocaleString()}</td>
                    <td style={{ ...s.td, textAlign: 'right', color: '#34d399' }}>${totalVendorActual.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Curated Concept Ideas */}
          {ideas.length > 0 && (
            <div style={s.sectionCard}>
              <h3 style={s.sectionTitle}>
                <Sparkles style={{ width: 18, height: 18, color: '#f472b6' }} />
                <span>4. Curated Inspiration &amp; DIY Tips</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.75rem' }}>
                {ideas.map((idea, idx) => (
                  <div key={idea.id || idx} style={{
                    padding: '0.9rem',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    fontSize: '0.775rem'
                  }}>
                    <h4 style={{ fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>{idea.title}</h4>
                    <p style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.5 }}>{idea.description}</p>
                    {idea.diyTip && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '6px',
                        background: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                        color: '#fcd34d',
                        fontSize: '0.725rem',
                        fontWeight: 500
                      }}>
                        💡 <strong>DIY Tip:</strong> {idea.diyTip}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Footer */}
          <div style={{
            paddingTop: '1.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            Generated by AuraPlan AI &bull; Powered by Google Gemini GenAI &bull; {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}
