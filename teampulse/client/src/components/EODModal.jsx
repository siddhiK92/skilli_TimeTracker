import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth }  from '../context/AuthContext';
import api from '../utils/api';
import { todayKey } from '../utils/helpers';
import {
  BriefcaseIcon, CheckCircleIcon, ClipboardIcon,
  PlusIcon, TrashIcon, XIcon, SaveIcon, CalendarIcon
} from './Icons';
import styles from './EODModal.module.css';

const emptyList = () => [''];

export default function EODModal({ onClose, onSaved }) {
  const { user }  = useAuth();
  const toast     = useToast();
  const [projects,  setProjects]  = useState(emptyList());
  const [completed, setCompleted] = useState(emptyList());
  const [planned,   setPlanned]   = useState(emptyList());
  const [saving,    setSaving]    = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/eod/my');
        const today = data.eods.find((e) => e.date === todayKey());
        if (today) {
          setProjects(today.projects.length   ? today.projects   : emptyList());
          setCompleted(today.completed.length ? today.completed  : emptyList());
          setPlanned(today.planned.length     ? today.planned    : emptyList());
        }
      } catch { /* ignore */ }
    };
    load();
  }, []);

  const updateItem = (setter, list, idx, val) => {
    const copy = [...list]; copy[idx] = val; setter(copy);
  };
  const addItem    = (setter, list) => setter([...list, '']);
  const removeItem = (setter, list, idx) => setter(list.filter((_, i) => i !== idx));

  const handleSave = async () => {
    const clean = (arr) => arr.map((s) => s.trim()).filter(Boolean);
    const p = clean(projects), c = clean(completed), pl = clean(planned);
    if (!p.length && !c.length && !pl.length) { toast.error('Please add at least one entry.'); return; }
    setSaving(true);
    try {
      await api.post('/eod', { projects: p, completed: c, planned: pl });
      toast.success('EOD Report saved successfully!');
      onSaved();
    } catch {
      toast.error('Failed to save EOD report');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { label: 'Projects Worked On',        icon: <BriefcaseIcon size={15} color="var(--secondary)" />,    list: projects,  setter: setProjects,  placeholder: 'e.g. Dashboard redesign' },
    { label: 'Tasks Completed Today',     icon: <CheckCircleIcon size={15} color="var(--secondary)" />,  list: completed, setter: setCompleted, placeholder: 'e.g. Fixed login bug' },
    { label: 'Tasks Planned for Tomorrow',icon: <ClipboardIcon size={15} color="var(--secondary)" />,    list: planned,   setter: setPlanned,   placeholder: 'e.g. Write unit tests' },
  ];

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div className={styles.modalTitleRow}>
            <FileTextIconInline />
            <div>
              <div className="modal-title">End of Day Report</div>
              <div className={styles.modalDate}>
                <CalendarIcon size={12} color="#7A8CA5" />
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        {sections.map(({ label, icon, list, setter, placeholder }) => (
          <div key={label} className={styles.section}>
            <div className={styles.sectionLabel}>{icon} {label}</div>
            <div className={styles.bulletList}>
              {list.map((val, idx) => (
                <div key={idx} className={styles.bulletItem}>
                  <div className={styles.bulletDot} />
                  <input
                    className={styles.bulletInput}
                    placeholder={placeholder}
                    value={val}
                    onChange={(e) => updateItem(setter, list, idx, e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addItem(setter, list); }}
                  />
                  {list.length > 1 && (
                    <button className={styles.removeBtn} onClick={() => removeItem(setter, list, idx)}>
                      <TrashIcon size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button className={styles.addBtn} onClick={() => addItem(setter, list)}>
              <PlusIcon size={14} color="currentColor" />
              Add entry
            </button>
          </div>
        ))}

        <div className={styles.actions}>
          <button className="btn btn-outline" onClick={onClose}>
            <XIcon size={14} /> Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <SaveIcon size={14} color="#fff" />
            {saving ? 'Saving…' : 'Save EOD Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline icon to avoid import cycle
const FileTextIconInline = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
    <polyline points="10 9 9 9 8 9"/>
  </svg>
);
