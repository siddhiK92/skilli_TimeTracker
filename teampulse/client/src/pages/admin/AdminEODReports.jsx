import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { getInitials, formatDate } from '../../utils/helpers';
import styles from './AdminEODReports.module.css';

const todayKey = () => new Date().toISOString().slice(0,10);

export default function AdminEODReports() {
  const toast = useToast();
  const [eods,     setEods]     = useState([]);
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [date,     setDate]     = useState(todayKey());
  const [userId,   setUserId]   = useState('');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(()=>{
    api.get('/admin/users').then(({data})=>setUsers(data.users)).catch(()=>{});
    fetchEODs();
  },[]);

  const fetchEODs = async (d=date,u=userId) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if(d) params.append('date',d);
      if(u) params.append('userId',u);
      const {data} = await api.get(`/admin/eod?${params}`);
      setEods(data.eods);
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const filtered = eods.filter(e=>(e.user?.name||'').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>EOD Reports</h1>
        <p className={styles.sub}>All end-of-day submissions</p>
      </div>

      <div className={styles.filterCard}>
        <div className={styles.filterRow}>
          <div><label className={styles.label}>Date</label><input type="date" className={styles.input} value={date} max={todayKey()} onChange={e=>setDate(e.target.value)} /></div>
          <div><label className={styles.label}>Member</label>
            <select className={styles.input} value={userId} onChange={e=>setUserId(e.target.value)}>
              <option value="">All Members</option>
              {users.map(u=><option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>
          <div className={styles.filterBtns}>
            <button className={styles.applyBtn} onClick={()=>fetchEODs(date,userId)}>Apply</button>
            <button className={styles.clearBtn} onClick={()=>{setDate(todayKey());setUserId('');fetchEODs(todayKey(),'');}}>Clear</button>
          </div>
        </div>
      </div>

      <div className={styles.toolbar}>
        <input className={styles.search} placeholder="Search member…" value={search} onChange={e=>setSearch(e.target.value)} />
        <span className={styles.count}>{filtered.length} report{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? <div className={styles.empty}>Loading…</div>
      : filtered.length===0 ? <div className={styles.empty}>No EOD reports found.</div>
      : filtered.map(eod=>{
        const u=eod.user||{};
        const isOpen=expanded===eod._id;
        const total=(eod.projects?.length||0)+(eod.completed?.length||0)+(eod.planned?.length||0);
        return (
          <div key={eod._id} className={`${styles.card} ${isOpen?styles.cardOpen:''}`}>
            <div className={styles.cardHeader} onClick={()=>setExpanded(isOpen?null:eod._id)}>
              <div className={styles.userCell}>
                <div className={styles.avatar} style={{background:u.color||'#7367F0'}}>{getInitials(u.name||'?')}</div>
                <div><div className={styles.name}>{u.name||'Unknown'}</div><div className={styles.role}>{u.role||'Team Member'}</div></div>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.dateChip}>{new Date(eod.date+'T00:00:00').toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span>
                <span className={styles.countChip}>{total} items</span>
                <span className={`${styles.chev} ${isOpen?styles.chevOpen:''}`}>▾</span>
              </div>
            </div>
            {isOpen && (
              <div className={styles.cardBody}>
                {eod.projects?.length>0&&<div className={styles.section}><div className={styles.sTitle}>Projects</div><ul className={styles.ul}>{eod.projects.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
                {eod.completed?.length>0&&<div className={styles.section}><div className={styles.sTitle}>Completed</div><ul className={styles.ul}>{eod.completed.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
                {eod.planned?.length>0&&<div className={styles.section}><div className={styles.sTitle}>Planned</div><ul className={styles.ul}>{eod.planned.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
                <div className={styles.submittedAt}>Submitted at {new Date(eod.createdAt).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',hour12:true})}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}