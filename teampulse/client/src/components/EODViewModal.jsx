import { formatDate, getInitials, getAvatarColor } from '../utils/helpers';
import { XIcon, InboxIcon, BriefcaseIcon, CheckCircleIcon, ClipboardIcon, CalendarIcon } from './Icons';
import styles from './EODViewModal.module.css';

export default function EODViewModal({ targetUser, eods, onClose }) {
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: targetUser.color || getAvatarColor(targetUser.name),
                display: 'grid', placeItems: 'center',
                color: '#fff', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0,
              }}
            >
              {getInitials(targetUser.name)}
            </div>
            <div>
              <div className="modal-title">{targetUser.name}'s EOD Reports</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {eods.length} report{eods.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><XIcon size={18} /></button>
        </div>

        {eods.length === 0 ? (
          <div className={styles.empty}>
            <InboxIcon size={40} color="#AAB7C4" strokeWidth={1.2} />
            <p>No EOD reports submitted yet.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {eods.map((eod) => (
              <div key={eod._id} className={styles.card}>
                <div className={styles.date}>
                  <CalendarIcon size={13} color="#7A8CA5" />
                  {formatDate(eod.date)}
                </div>

                {eod.projects?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                      <BriefcaseIcon size={13} color="var(--secondary)" /> Projects
                    </div>
                    <ul className={styles.bullets}>
                      {eod.projects.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {eod.completed?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                      <CheckCircleIcon size={13} color="var(--secondary)" /> Completed
                    </div>
                    <ul className={styles.bullets}>
                      {eod.completed.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}

                {eod.planned?.length > 0 && (
                  <div className={styles.section}>
                    <div className={styles.sectionTitle}>
                      <ClipboardIcon size={13} color="var(--secondary)" /> Planned
                    </div>
                    <ul className={styles.bullets}>
                      {eod.planned.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
