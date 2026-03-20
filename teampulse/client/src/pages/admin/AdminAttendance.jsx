import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { getInitials, formatTime, calcWorkingHours } from '../../utils/helpers';
import styles from './AdminAttendance.module.css';

const todayKey = () => new Date().toISOString().slice(0,10);
const daysAgo  = n => { const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };

const RANGES = [
  { label:'Today',      from:todayKey(),  to:todayKey()  },
  { label:'Yesterday',  from:daysAgo(1),  to:daysAgo(1)  },
  { label:'Last 7 days',from:daysAgo(6),  to:todayKey()  },
  { label:'Last 30 days',from:daysAgo(29),to:todayKey()  },
];

export default function AdminAttendance() {
  const toast = useToast();
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [from,    setFrom]    = useState(todayKey());
  const [to,      setTo]      = useState(todayKey());
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState('all');

  const fetch = async (f,t) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/attendance?from=${f}&to=${t}`);
      setLogs(data.logs);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetch(from,to); },[]);

  const filtered = logs.filter(l => {
    const name = l.user?.name?.toLowerCase()||'';
    return name.includes(search.toLowerCase()) && (status==='all'||l.status===status);
  });

  const fmtMs = ms => { if(!ms) return '—'; return `${Math.floor(ms/3600000)}h ${Math.floor((ms%3600000)/60000)}m`; };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Attendance Report</h1>
        <p className={styles.sub}>Filter by date range</p>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.quickBtns}>
          {RANGES.map(r=>(
            <button key={r.label} className={`${styles.qBtn} ${from===r.from&&to===r.to?styles.qBtnActive:''}`}
              onClick={()=>{setFrom(r.from);setTo(r.to);fetch(r.from,r.to);}}>
              {r.label}
            </button>
          ))}
        </div>
        <div className={styles.dateRow}>
          <div><label className={styles.label}>From</label><input type="date" className={styles.input} value={from} max={to} onChange={e=>setFrom(e.target.value)} /></div>
          <span className={styles.sep}>—</span>
          <div><label className={styles.label}>To</label><input type="date" className={styles.input} value={to} min={from} max={todayKey()} onChange={e=>setTo(e.target.value)} /></div>
          <button className={styles.applyBtn} onClick={()=>fetch(from,to)}>Apply</button>
        </div>
      </div>

      <div className={styles.summary}>
        {[
          {label:'Total Records', value:logs.length},
          {label:'Present', value:logs.filter(l=>l.status==='present').length, color:'#28C76F'},
          {label:'On Leave', value:logs.filter(l=>l.status==='leave').length, color:'#FF9F43'},
        ].map(s=>(
          <div key={s.label} className={styles.summaryItem}>
            <span className={styles.summaryNum} style={{color:s.color||'var(--text-primary)'}}>{s.value}</span>
            <span className={styles.summaryLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.toolbar}>
        <input className={styles.search} placeholder="Search member…" value={search} onChange={e=>setSearch(e.target.value)} />
        <div className={styles.filterBtns}>
          {['all','present','leave'].map(s=>(
            <button key={s} className={`${styles.fBtn} ${status===s?styles.fBtnActive:''}`} onClick={()=>setStatus(s)}>
              {s==='all'?'All':s==='present'?'Present':'On Leave'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Member</th><th>Date</th><th>Status</th><th>Login</th><th>Logout</th><th>Hours</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className={styles.center}>Loading…</td></tr>
            : filtered.length===0 ? <tr><td colSpan={6} className={styles.center}>No records found</td></tr>
            : filtered.map(log=>{
              const u=log.user||{};
              const sc=log.status==='present'?styles.badgeGreen:log.status==='leave'?styles.badgeOrange:styles.badgeRed;
              return (
                <tr key={log._id}>
                  <td><div className={styles.userCell}><div className={styles.avatar} style={{background:u.color||'#7367F0'}}>{getInitials(u.name||'?')}</div><div><div className={styles.name}>{u.name||'Unknown'}</div><div className={styles.role}>{u.role||'Team Member'}</div></div></div></td>
                  <td className={styles.mono}>{new Date(log.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</td>
                  <td><span className={`${styles.badge} ${sc}`}>{log.status}</span></td>
                  <td className={styles.mono}>{formatTime(log.loginTime)}</td>
                  <td className={styles.mono}>{formatTime(log.logoutTime)}</td>
                  <td className={styles.bold}>{log.workingMs>0?fmtMs(log.workingMs):log.loginTime?calcWorkingHours(log.loginTime,log.logoutTime):'—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}