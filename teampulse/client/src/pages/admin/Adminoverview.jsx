import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { getInitials, formatTime, calcWorkingHours, formatDate } from '../../utils/helpers';
import styles from './AdminOverview.module.css';

const REFRESH_INTERVAL = 30000;

export default function AdminOverview() {
  const toast    = useToast();
  const navigate = useNavigate();
  const timerRef = useRef(null);

  const [stats,       setStats]       = useState(null);
  const [allUsers,    setAllUsers]    = useState([]);
  const [todayEODs,   setTodayEODs]   = useState([]);
  const [attendLogs,  setAttendLogs]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab,   setActiveTab]   = useState('live');
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('all');
  const [expandedEOD, setExpandedEOD] = useState(null);
  const [tick,        setTick]        = useState(0); // for live clock

  // Live clock tick every minute
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  const fetchAll = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [overviewRes, usersRes, eodRes, attendRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/users'),
        api.get('/admin/eod?date=' + today),
        api.get('/admin/attendance?from=' + today + '&to=' + today),
      ]);
      setStats(overviewRes.data.stats);
      setAllUsers(usersRes.data.users);
      setTodayEODs(eodRes.data.eods);
      setAttendLogs(attendRes.data.logs);
      setLastUpdated(new Date());
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(true);
    timerRef.current = setInterval(() => fetchAll(false), REFRESH_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [fetchAll]);

  // Build maps
  const eodMap = {};
  todayEODs.forEach(e => { if (e.user) eodMap[e.user._id || e.user] = e; });

  // Filter users
  const filtered = allUsers.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        (u.role||'').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const onlineUsers  = allUsers.filter(u => u.status === 'online');
  const offlineUsers = allUsers.filter(u => u.status === 'offline');
  const leaveUsers   = allUsers.filter(u => u.status === 'leave');

  if (loading) return (
    <div className={styles.loaderWrap}>
      <div className={styles.spinner} />
      Loading dashboard…
    </div>
  );

  return (
    <div className={styles.page}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.pageTitle}>Admin Dashboard</h1>
          <p className={styles.pageSub}>
            {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            {lastUpdated && (
              <span className={styles.updatedAt}>
                &nbsp;· Updated {lastUpdated.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}
              </span>
            )}
          </p>
        </div>
        <button className={styles.refreshBtn} onClick={() => fetchAll(false)}>
          <RefreshIcon /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      {stats && (
        <div className={styles.statsGrid}>
          <StatCard icon={<PeopleIcon />} label="Total Members"  value={stats.totalUsers}      color="#7367F0" bg="rgba(115,103,240,0.1)" />
          <StatCard icon={<OnlineIcon />} label="Online Now"     value={onlineUsers.length}    color="#28C76F" bg="rgba(40,199,111,0.1)"  />
          <StatCard icon={<OfflineIcon/>} label="Offline"        value={offlineUsers.length}   color="#EA5455" bg="rgba(234,84,85,0.1)"   />
          <StatCard icon={<LeaveIcon />}  label="On Leave"       value={leaveUsers.length}     color="#FF9F43" bg="rgba(255,159,67,0.1)"  />
          <StatCard icon={<ClockSVG />}   label="Avg Work Hours" value={stats.avgWorkingHours} color="#00CFE8" bg="rgba(0,207,232,0.1)"   />
          <StatCard icon={<EodIcon />}    label="EOD Submitted"  value={stats.todayEODs}       color="#7367F0" bg="rgba(115,103,240,0.1)" />
        </div>
      )}

      {/* ── Quick status pills ── */}
      <div className={styles.pillRow}>
        {[
          { label: `${onlineUsers.length} Online`,    color: '#28C76F', bg: 'rgba(40,199,111,0.1)',  val: 'online'  },
          { label: `${offlineUsers.length} Offline`,  color: '#EA5455', bg: 'rgba(234,84,85,0.1)',   val: 'offline' },
          { label: `${leaveUsers.length} On Leave`,   color: '#FF9F43', bg: 'rgba(255,159,67,0.1)',  val: 'leave'   },
          { label: `${todayEODs.length} EOD Done`,    color: '#7367F0', bg: 'rgba(115,103,240,0.1)', val: 'eod'     },
        ].map(p => (
          <div key={p.val} className={styles.pill} style={{ background: p.bg, color: p.color }}>
            <span className={styles.pillDot} style={{ background: p.color }} />
            {p.label}
          </div>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className={styles.tabs}>
        {[
          { key: 'live',    label: 'Live Team Status' },
          { key: 'eod',     label: `EOD Reports (${todayEODs.length})` },
          { key: 'history', label: 'Today\'s Attendance Log' },
        ].map(t => (
          <button
            key={t.key}
            className={`${styles.tab} ${activeTab === t.key ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════
          TAB 1 — LIVE TEAM STATUS
      ══════════════════════════════════════ */}
      {activeTab === 'live' && (
        <>
          {/* Search + Filter */}
          <div className={styles.toolbar}>
            <input
              className={styles.searchInput}
              placeholder="Search by name or role…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className={styles.filterBtns}>
              {['all','online','offline','leave'].map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${statusFilter === f ? styles.filterActive : ''}`}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === 'all' ? 'All' : f === 'online' ? 'Online' : f === 'offline' ? 'Offline' : 'On Leave'}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Status</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                  <th>Working Hours</th>
                  <th>EOD Today</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className={styles.emptyCell}>No members found.</td></tr>
                ) : filtered.map(u => {
                  const hasEOD   = !!eodMap[u._id];
                  const badgeCls = u.status === 'online' ? styles.badgeOnline : u.status === 'leave' ? styles.badgeLeave : styles.badgeOffline;
                  const statusLabel = u.status === 'online' ? 'Online' : u.status === 'leave' ? 'On Leave' : 'Offline';
                  // Live working hours — recalculates every tick
                  const workHrs = u.loginTime
                    ? calcWorkingHours(u.loginTime, u.status === 'online' ? null : u.logoutTime)
                    : '—';

                  return (
                    <tr key={u._id} className={u.status === 'online' ? styles.rowOnline : ''}>
                      <td>
                        <div className={styles.userCell}>
                          <div className={styles.avatarWrap}>
                            <div className={styles.avatar} style={{ background: u.color || '#7367F0' }}>
                              {getInitials(u.name)}
                            </div>
                            <span className={`${styles.dot} ${styles['dot_' + u.status]}`} />
                          </div>
                          <div>
                            <div className={styles.userName}>{u.name}</div>
                            <div className={styles.userRole}>{u.role || 'Team Member'}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`${styles.badge} ${badgeCls}`}>{statusLabel}</span></td>
                      <td className={styles.mono}>{formatTime(u.loginTime)}</td>
                      <td className={styles.mono}>{formatTime(u.logoutTime)}</td>
                      <td>
                        <span className={`${styles.hoursChip} ${u.status === 'online' ? styles.hoursLive : ''}`}>
                          {u.status === 'online' && <span className={styles.liveDot} />}
                          {workHrs}
                        </span>
                      </td>
                      <td>
                        {hasEOD
                          ? <span className={styles.eodDone}><CheckSVG /> Submitted</span>
                          : <span className={styles.eodPending}>Pending</span>
                        }
                      </td>
                      <td>
                        <button
                          className={styles.viewBtn}
                          onClick={() => navigate(`/admin/users/${u._id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════
          TAB 2 — EOD REPORTS
      ══════════════════════════════════════ */}
      {activeTab === 'eod' && (
        <div>
          {/* Who hasn't submitted */}
          {(() => {
            const submittedIds = new Set(todayEODs.map(e => e.user?._id || e.user));
            const pending = allUsers.filter(u => !submittedIds.has(u._id));
            return pending.length > 0 ? (
              <div className={styles.pendingBanner}>
                <WarnSVG />
                <strong>{pending.length} member{pending.length > 1 ? 's' : ''} yet to submit EOD:</strong>
                &nbsp;{pending.map(u => u.name).join(', ')}
              </div>
            ) : (
              <div className={styles.allDoneBanner}><CheckSVG /> All members have submitted their EOD reports!</div>
            );
          })()}

          {todayEODs.length === 0 ? (
            <div className={styles.emptyState}>No EOD reports submitted today yet.</div>
          ) : (
            <div className={styles.eodGrid}>
              {todayEODs.map(eod => {
                const u      = eod.user || {};
                const isOpen = expandedEOD === eod._id;
                const total  = (eod.projects?.length || 0) + (eod.completed?.length || 0) + (eod.planned?.length || 0);
                return (
                  <div key={eod._id} className={`${styles.eodCard} ${isOpen ? styles.eodCardOpen : ''}`}>
                    <div className={styles.eodCardHeader} onClick={() => setExpandedEOD(isOpen ? null : eod._id)}>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: u.color || '#7367F0' }}>
                          {getInitials(u.name || '?')}
                        </div>
                        <div>
                          <div className={styles.userName}>{u.name || 'Unknown'}</div>
                          <div className={styles.userRole}>{u.role || 'Team Member'}</div>
                        </div>
                      </div>
                      <div className={styles.eodMeta}>
                        <span className={styles.eodTime}>
                          {new Date(eod.createdAt).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true })}
                        </span>
                        <span className={styles.eodCount}>{total} items</span>
                        <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}><ChevSVG /></span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className={styles.eodBody}>
                        {eod.projects?.length > 0 && (
                          <div className={styles.eodSection}>
                            <div className={styles.eodSectionTitle}>Projects Worked On</div>
                            <ul className={styles.eodList}>{eod.projects.map((p,i) => <li key={i}>{p}</li>)}</ul>
                          </div>
                        )}
                        {eod.completed?.length > 0 && (
                          <div className={styles.eodSection}>
                            <div className={styles.eodSectionTitle}>Completed Today</div>
                            <ul className={styles.eodList}>{eod.completed.map((p,i) => <li key={i}>{p}</li>)}</ul>
                          </div>
                        )}
                        {eod.planned?.length > 0 && (
                          <div className={styles.eodSection}>
                            <div className={styles.eodSectionTitle}>Planned for Tomorrow</div>
                            <ul className={styles.eodList}>{eod.planned.map((p,i) => <li key={i}>{p}</li>)}</ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════
          TAB 3 — TODAY'S ATTENDANCE LOG
      ══════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Member</th>
                <th>Date</th>
                <th>Attendance</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Hours Worked</th>
              </tr>
            </thead>
            <tbody>
              {attendLogs.length === 0 ? (
                <tr><td colSpan={6} className={styles.emptyCell}>No attendance records for today yet.</td></tr>
              ) : attendLogs.map(log => {
                const u = log.user || {};
                const statusCls = log.status === 'present' ? styles.badgeOnline : log.status === 'leave' ? styles.badgeLeave : styles.badgeOffline;
                const ms = log.workingMs || 0;
                const h  = Math.floor(ms / 3600000);
                const m  = Math.floor((ms % 3600000) / 60000);
                const hoursStr = ms > 0 ? `${h}h ${m}m` : log.loginTime ? calcWorkingHours(log.loginTime, log.logoutTime) : '—';
                return (
                  <tr key={log._id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.avatar} style={{ background: u.color || '#7367F0' }}>
                          {getInitials(u.name || '?')}
                        </div>
                        <div>
                          <div className={styles.userName}>{u.name || 'Unknown'}</div>
                          <div className={styles.userRole}>{u.role || 'Team Member'}</div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(log.date + 'T00:00:00').toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                    </td>
                    <td><span className={`${styles.badge} ${statusCls}`}>{log.status}</span></td>
                    <td className={styles.mono}>{formatTime(log.loginTime)}</td>
                    <td className={styles.mono}>{formatTime(log.logoutTime)}</td>
                    <td><span className={styles.hoursChip}>{hoursStr}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

/* ── Reusable Stat Card ── */
function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: bg }}>{icon}</div>
      <div>
        <div className={styles.statValue} style={{ color }}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  );
}

/* ── Inline SVG Icons ── */
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>
);
const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7367F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const OnlineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#28C76F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);
const OfflineIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EA5455" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
    <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
  </svg>
);
const LeaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9F43" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 12a11.05 11.05 0 0 0-22 0zm-5 7a3 3 0 0 1-6 0v-7"/>
  </svg>
);
const ClockSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00CFE8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const EodIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7367F0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const CheckSVG = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const WarnSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const ChevSVG = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);