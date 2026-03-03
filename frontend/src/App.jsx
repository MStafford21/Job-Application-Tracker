import { useState, useEffect, useCallback } from 'react';
import { jobApplicationsApi } from './services/api';

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUSES = ['Wishlist', 'Applied', 'Phone Screen', 'Interview', 'Technical', 'Offer', 'Rejected', 'Withdrawn'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const STATUS_CONFIG = {
  'Wishlist':     { color: '#64748b', bg: '#1e293b', dot: '#64748b' },
  'Applied':      { color: '#3b82f6', bg: '#1d3461', dot: '#3b82f6' },
  'Phone Screen': { color: '#8b5cf6', bg: '#2e1065', dot: '#8b5cf6' },
  'Interview':    { color: '#f59e0b', bg: '#451a03', dot: '#f59e0b' },
  'Technical':    { color: '#06b6d4', bg: '#0c4a6e', dot: '#06b6d4' },
  'Offer':        { color: '#22c55e', bg: '#052e16', dot: '#22c55e' },
  'Rejected':     { color: '#ef4444', bg: '#450a0a', dot: '#ef4444' },
  'Withdrawn':    { color: '#6b7280', bg: '#1f2937', dot: '#6b7280' },
};

const PRIORITY_CONFIG = {
  'Low':    { color: '#64748b', symbol: '↓' },
  'Medium': { color: '#f59e0b', symbol: '→' },
  'High':   { color: '#ef4444', symbol: '↑' },
};

const EMPTY_FORM = {
  companyName: '', jobTitle: '', jobUrl: '', location: '',
  salary: '', status: 'Applied', priority: 'Medium',
  appliedDate: '', followUpDate: '', notes: '', contactName: '', contactEmail: ''
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Applied'];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}33`,
      padding: '2px 10px', borderRadius: '20px',
      fontSize: '12px', fontWeight: 600, letterSpacing: '0.02em',
      display: 'inline-flex', alignItems: 'center', gap: '5px'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG['Medium'];
  return (
    <span style={{ color: cfg.color, fontSize: '12px', fontWeight: 700 }}>
      {cfg.symbol} {priority}
    </span>
  );
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar({ stats }) {
  const items = [
    { label: 'Total', value: stats.total, color: '#e2e8f0' },
    { label: 'Active', value: stats.active, color: '#3b82f6' },
    { label: 'Offers', value: stats.offers, color: '#22c55e' },
    { label: 'Rejected', value: stats.rejected, color: '#ef4444' },
  ];
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
      {items.map(i => (
        <div key={i.label} style={{
          flex: 1, background: '#0f172a', border: '1px solid #1e293b',
          borderRadius: 12, padding: '18px 20px',
          borderTop: `3px solid ${i.color}`
        }}>
          <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{i.label}</div>
          <div style={{ color: i.color, fontSize: 32, fontWeight: 800, fontFamily: 'Georgia, serif' }}>{i.value || 0}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 20
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: '#0f172a', border: '1px solid #1e293b',
        borderRadius: 16, width: '100%', maxWidth: 620,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
      }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 20, cursor: 'pointer', padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: '24px 28px' }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Form ────────────────────────────────────────────────────────────────────

function ApplicationForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.companyName || !form.jobTitle) return alert('Company and job title are required.');
    setLoading(true);
    await onSubmit(form);
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', background: '#1e293b', border: '1px solid #334155',
    borderRadius: 8, color: '#e2e8f0', padding: '10px 12px',
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };
  const labelStyle = { color: '#94a3b8', fontSize: 12, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 };
  const fieldStyle = { marginBottom: 18 };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Company *</label>
          <input style={inputStyle} value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="e.g. Stripe" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Job Title *</label>
          <input style={inputStyle} value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="e.g. Senior Engineer" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Priority</label>
          <select style={inputStyle} value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Remote / City, State" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Salary Range</label>
          <input style={inputStyle} value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="$120k - $160k" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Applied Date</label>
          <input style={inputStyle} type="date" value={form.appliedDate?.split('T')[0] || ''} onChange={e => set('appliedDate', e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Follow-up Date</label>
          <input style={inputStyle} type="date" value={form.followUpDate?.split('T')[0] || ''} onChange={e => set('followUpDate', e.target.value)} />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Contact Name</label>
          <input style={inputStyle} value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Recruiter name" />
        </div>
        <div style={fieldStyle}>
          <label style={labelStyle}>Contact Email</label>
          <input style={inputStyle} value={form.contactEmail} onChange={e => set('contactEmail', e.target.value)} placeholder="recruiter@company.com" />
        </div>
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Job URL</label>
        <input style={inputStyle} value={form.jobUrl} onChange={e => set('jobUrl', e.target.value)} placeholder="https://..." />
      </div>
      <div style={fieldStyle}>
        <label style={labelStyle}>Notes</label>
        <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this role..." />
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8 }}>
        <button onClick={onCancel} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
        <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 24px', background: '#3b82f6', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving…' : 'Save Application'}
        </button>
      </div>
    </div>
  );
}

// ─── Detail Panel ────────────────────────────────────────────────────────────

function DetailPanel({ app, onEdit, onDelete, onClose }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: '0 0 6px', color: '#f1f5f9', fontSize: 22, fontWeight: 700 }}>{app.companyName}</h3>
          <div style={{ color: '#94a3b8', fontSize: 16 }}>{app.jobTitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <StatusBadge status={app.status} />
          <PriorityBadge priority={app.priority} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        {[
          ['📍 Location', app.location],
          ['💰 Salary', app.salary],
          ['📅 Applied', formatDate(app.appliedDate)],
          ['🔔 Follow-up', formatDate(app.followUpDate)],
          ['👤 Contact', app.contactName],
          ['📧 Email', app.contactEmail],
        ].map(([label, val]) => val && (
          <div key={label} style={{ background: '#1e293b', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4 }}>{label}</div>
            <div style={{ color: '#e2e8f0', fontSize: 14 }}>{val}</div>
          </div>
        ))}
      </div>

      {app.jobUrl && (
        <div style={{ marginBottom: 16 }}>
          <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', fontSize: 14, textDecoration: 'none' }}>
            🔗 View Job Posting →
          </a>
        </div>
      )}

      {app.notes && (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '14px', marginBottom: 20 }}>
          <div style={{ color: '#64748b', fontSize: 11, marginBottom: 8 }}>NOTES</div>
          <div style={{ color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{app.notes}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={() => onDelete(app.id)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ef444433', borderRadius: 8, color: '#ef4444', cursor: 'pointer', fontSize: 13 }}>Delete</button>
        <button onClick={() => onEdit(app)} style={{ padding: '8px 20px', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#e2e8f0', cursor: 'pointer', fontSize: 13 }}>Edit</button>
      </div>
    </div>
  );
}

// ─── Application Row ─────────────────────────────────────────────────────────

function ApplicationRow({ app, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={() => onClick(app)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.2fr 1.2fr 1fr',
        alignItems: 'center', padding: '14px 20px',
        background: hover ? '#0f172a' : 'transparent',
        borderBottom: '1px solid #1e293b', cursor: 'pointer',
        transition: 'background 0.15s', gap: 12
      }}
    >
      <div>
        <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{app.companyName}</div>
        {app.location && <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{app.location}</div>}
      </div>
      <div style={{ color: '#94a3b8', fontSize: 13 }}>{app.jobTitle}</div>
      <div><StatusBadge status={app.status} /></div>
      <div><PriorityBadge priority={app.priority} /></div>
      <div style={{ color: '#64748b', fontSize: 12 }}>{formatDate(app.appliedDate)}</div>
      <div style={{ color: '#475569', fontSize: 12 }}>{app.salary || '—'}</div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [apps, setApps] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, offers: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'detail'
  const [selected, setSelected] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        jobApplicationsApi.getAll({ search: search || undefined, status: filterStatus || undefined }),
        jobApplicationsApi.getStats()
      ]);
      setApps(appsRes.data);
      setStats(statsRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [search, filterStatus]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async (form) => {
    await jobApplicationsApi.create(form);
    setModal(null);
    loadData();
  };

  const handleUpdate = async (form) => {
    await jobApplicationsApi.update(selected.id, form);
    setModal(null);
    setSelected(null);
    loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this application?')) return;
    await jobApplicationsApi.delete(id);
    setModal(null);
    setSelected(null);
    loadData();
  };

  const handleRowClick = async (app) => {
    const detail = await jobApplicationsApi.getById(app.id);
    setSelected(detail.data);
    setModal('detail');
  };

  const openEdit = (app) => {
    setSelected(app);
    setModal('edit');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020817', color: '#e2e8f0', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0a0f1e' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📋</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#f1f5f9' }}>JobTracker</div>
            <div style={{ fontSize: 11, color: '#475569', letterSpacing: '0.05em' }}>APPLICATION PIPELINE</div>
          </div>
        </div>
        <button
          onClick={() => setModal('add')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', border: 'none',
            borderRadius: 10, color: '#fff', padding: '10px 20px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(99,102,241,0.4)'
          }}
        >
          + Add Application
        </button>
      </div>

      <div style={{ padding: '32px' }}>
        <StatsBar stats={stats} />

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies, roles, locations..."
            style={{
              flex: 1, background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 10, color: '#e2e8f0', padding: '10px 16px',
              fontSize: 14, outline: 'none'
            }}
          />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 10, color: filterStatus ? '#e2e8f0' : '#64748b',
              padding: '10px 16px', fontSize: 14, outline: 'none', cursor: 'pointer'
            }}
          >
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{ background: '#0a0f1e', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '2fr 2fr 1.5fr 1.2fr 1.2fr 1fr',
            padding: '10px 20px', borderBottom: '1px solid #1e293b', gap: 12
          }}>
            {['Company', 'Role', 'Status', 'Priority', 'Applied', 'Salary'].map(h => (
              <div key={h} style={{ color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>Loading…</div>
          ) : apps.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#475569' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>No applications yet</div>
              <div style={{ fontSize: 13 }}>Start tracking by adding your first application</div>
            </div>
          ) : (
            apps.map(app => <ApplicationRow key={app.id} app={app} onClick={handleRowClick} />)
          )}
        </div>

        <div style={{ marginTop: 12, color: '#475569', fontSize: 12, textAlign: 'right' }}>
          {apps.length} application{apps.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Modals */}
      {modal === 'add' && (
        <Modal title="New Application" onClose={() => setModal(null)}>
          <ApplicationForm onSubmit={handleCreate} onCancel={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'edit' && selected && (
        <Modal title="Edit Application" onClose={() => { setModal(null); setSelected(null); }}>
          <ApplicationForm
            initial={{
              companyName: selected.companyName || '',
              jobTitle: selected.jobTitle || '',
              jobUrl: selected.jobUrl || '',
              location: selected.location || '',
              salary: selected.salary || '',
              status: selected.status || 'Applied',
              priority: selected.priority || 'Medium',
              appliedDate: selected.appliedDate?.split('T')[0] || '',
              followUpDate: selected.followUpDate?.split('T')[0] || '',
              notes: selected.notes || '',
              contactName: selected.contactName || '',
              contactEmail: selected.contactEmail || '',
            }}
            onSubmit={handleUpdate}
            onCancel={() => { setModal(null); setSelected(null); }}
          />
        </Modal>
      )}
      {modal === 'detail' && selected && (
        <Modal title="Application Details" onClose={() => { setModal(null); setSelected(null); }}>
          <DetailPanel
            app={selected}
            onEdit={(app) => { setSelected(app); setModal('edit'); }}
            onDelete={handleDelete}
            onClose={() => { setModal(null); setSelected(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
