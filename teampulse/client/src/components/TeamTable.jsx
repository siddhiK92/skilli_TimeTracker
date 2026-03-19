import { getInitials, getAvatarColor, formatTime, calcWorkingHours } from '../utils/helpers';
import { EyeIcon, FileTextIcon, ClockIcon } from './Icons';
import styles from './TeamTable.module.css';

export default function TeamTable({ users, currentUser, todayEODMap, onViewEOD, onOpenEOD }) {
  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Member</th>
            <th>Status</th>
            <th>Login Time</th>
            <th>Logout Time</th>
            <th>Working Hours</th>
            <th>Today's EOD</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7}>
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#AAB7C4" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                  </div>
                  <p>No team members found.</p>
                </div>
              </td>
            </tr>
          ) : (
            users.map((u) => {
              const isMe     = u._id === currentUser?._id;
              const eod      = todayEODMap[u._id];
              const badgeCls = u.status === 'online' ? 'badge-online' : u.status === 'leave' ? 'badge-leave' : 'badge-offline';
              const badgeTxt = u.status === 'online' ? 'Online' : u.status === 'leave' ? 'On Leave' : 'Offline';

              return (
                <tr key={u._id} className={isMe ? styles.myRow : ''}>
                  {/* Member */}
                  <td>
                    <div className={styles.userCell}>
                      <div
                        className={styles.avatar}
                        style={{ background: u.color || getAvatarColor(u.name) }}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className={styles.name}>
                          {u.name}
                          {isMe && <span className={styles.youTag}>You</span>}
                        </div>
                        <div className={styles.role}>{u.role || 'Team Member'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge ${badgeCls} ${u.status === 'online' ? 'pulse' : ''}`}>
                      {badgeTxt}
                    </span>
                  </td>

                  {/* Login Time */}
                  <td>
                    <div className={styles.timeCell}>
                      <ClockIcon size={13} color="#7A8CA5" />
                      <span className={styles.timeText}>{formatTime(u.loginTime)}</span>
                    </div>
                  </td>

                  {/* Logout Time */}
                  <td>
                    <div className={styles.timeCell}>
                      <ClockIcon size={13} color="#7A8CA5" />
                      <span className={styles.timeText}>{formatTime(u.logoutTime)}</span>
                    </div>
                  </td>

                  {/* Working Hours */}
                  <td>
                    <span className={styles.workHours}>
                      {u.loginTime ? calcWorkingHours(u.loginTime, u.logoutTime) : '—'}
                    </span>
                  </td>

                  {/* EOD */}
                  <td>
                    {eod ? (
                      <button className="btn btn-outline btn-sm" onClick={() => onViewEOD(u)}>
                        <EyeIcon size={13} color="currentColor" />
                        View
                      </button>
                    ) : (
                      <span className={styles.noEod}>Not submitted</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    {isMe ? (
                      <button className="btn btn-primary btn-sm" onClick={onOpenEOD}>
                        <FileTextIcon size={13} color="#fff" />
                        EOD Report
                      </button>
                    ) : (
                      <span className={styles.noEod}>—</span>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
