import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { getInitials, formatTime, calcWorkingHours, formatDate } from '../../utils/helpers';
import styles from './AdminUserDetail.module.css';

export default function AdminUserDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [activeTab,setActiveTab]= useState('attendance');
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newPass,  setNewPass]  = useState('');
  const [showReset,setShowReset]= useState(false);

  const load = async () => {
    try {
      const { data: res } = await api.get(`/admin/users/${id}`);
      setData(res);
      setEditForm({ name: res.user.name, role: res.user.role, color: res.user.color });
    } catch { toast.error('Failed to load user'); }
    finally  { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleSave = async () => {
    try {
      await api.patch(`/admin/users/${id}`, editForm);
      toast.success('Updated!'); setEditMode(false); load();
    } catch { toast.error('Failed'); }
  };

  const handleToggleActive = async () => {
    try {
      await api.patch(`/admin/users/${id}`, { isActive: !data.user.isActive });
      toast.success('Updated!'); load();
    } catch { toast.error('Failed'); }
  };

  const handleToggleAdmin = async () => {
    try {
      await api.patch(`/admin/users/${id}`, { isAdmin: !data.user.isAdmin });
      toast.success('Updated!'); load();
    } catch { toast.error('Failed'); }
  };

  const handleResetPass = async () => {
    if (!newPass || newPass.length < 6) { toast.error('Min 6 chars'); return; }
    try {
      await api.patch(`/admin/users/${id}/reset-password`, { newPassword: newPass });
      toast.success('Password reset!'); setShowReset(false); setNewPass('');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className={styles.loader}>Loading…</div>;
  if (!data)   return null;

  const { user, logs, eods, stats } = data;
  const COLORS = ['#7367F0','#28C76F','#FF9F43','#EA5455','#00CFE8','#1F3A63'];

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate('/admin/users')}>
        ← Back to Users
      </button>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileLeft}>
          <div className={styles.bigAvatar} style={{ background: user.color || '#7367F0' }}>
            {getInitials(user.name)}
          </div>
          {editMode ? (
            <div className={styles.editFields}>
              <div style={{marginBottom:10}}>
                <label className={styles.label}>Name</label>
                <input className={styles.input} value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} />
              </div>
              <div style={{marginBottom:10}}>
                <label className={styles.label}>Role</label>
                <input className={styles.input} value={editForm.role} onChange={e=>setEditForm({...editForm,role:e.target.value})} />
              </div>
              <div style={{marginBottom:12}}>
                <label className={styles.label}>Color</label>
                <div className={styles.colors}>
                  {COLORS.map(c=>(
                    <div key={c} onClick={()=>setEditForm({...editForm,color:c})}
                      className={`${styles.colorDot} ${editForm.color===c?styles.colorSelected:''}`}
                      style={{background:c}} />
                  ))}
                </div>
              </div>
              <div className={styles.editBtns}>
                <button className={styles.btnPrimary} onClick={handleSave}>Save</button>
                <button className={styles.btnOutline} onClick={()=>setEditMode(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div>
              <div className={styles.profileName}>
                {user.name}
                {user.isAdmin && <span className={styles.adminTag}>Admin</span>}
              </div>
              <div className={styles.profileMeta}>@{user.username} · {user.email}</div>
              <div className={styles.profileRole}>{user.role || 'Team Member'}</div>
              <span className={`${styles.badge} ${user.isActive?styles.badgeGreen:styles.badgeRed}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          )}
        </div>

        <div className={styles.profileActions}>
          {!editMode && <button className={styles.btnOutline} onClick={()=>setEditMode(true)}>Edit</button>}
          <button className={`${styles.btn} ${user.isActive?styles.btnOrange:styles.btnGreen}`} onClick={handleToggleActive}>
            {user.isActive ? 'Deactivate' : 'Activate'}
          </button>
          <button className={`${styles.btn} ${user.isAdmin?styles.btnRed:styles.btnOutline}`} onClick={handleToggleAdmin}>
            {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
          </button>
          <button className={styles.btnOutline} onClick={()=>setShowReset(!showReset)}>Reset Password</button>
        </div>
      </div>

      {/* Password Reset */}
      {showReset && (
        <div className={styles.resetBox}>
          <input className={styles.input} type="password" placeholder="New password (min 6)" value={newPass} onChange={e=>setNewPass(e.target.value)} style={{maxWidth:260}} />
          <button className={styles.btnPrimary} onClick={handleResetPass}>Set Password</button>
          <button className={styles.btnOutline} onClick={()=>setShowReset(false)}>Cancel</button>
        </div>
      )}

      {/* Stats */}
      <div className={styles.statsGrid}>
        {[
          { label:'Days Present',    value: stats.totalDaysPresent   },
          { label:'Days on Leave',   value: stats.totalDaysLeave     },
          { label:'Total Hours (30d)',value: stats.totalWorkingHours },
          { label:'EOD Reports',     value: stats.eodSubmissions     },
        ].map(s=>(
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab==='attendance'?styles.tabActive:''}`} onClick={()=>setActiveTab('attendance')}>Attendance Log</button>
        <button className={`${styles.tab} ${activeTab==='eod'?styles.tabActive:''}`} onClick={()=>setActiveTab('eod')}>EOD Reports</button>
      </div>

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>Date</th><th>Status</th><th>Login</th><th>Logout</th><th>Hours</th></tr></thead>
            <tbody>
              {logs.length === 0
                ? <tr><td colSpan={5} className={styles.empty}>No records found</td></tr>
                : logs.map(log=>(
                  <tr key={log._id}>
                    <td className={styles.mono}>{formatDate(log.date)}</td>
                    <td><span className={`${styles.badge} ${log.status==='present'?styles.badgeGreen:log.status==='leave'?styles.badgeOrange:styles.badgeRed}`}>{log.status}</span></td>
                    <td className={styles.mono}>{formatTime(log.loginTime)}</td>
                    <td className={styles.mono}>{formatTime(log.logoutTime)}</td>
                    <td className={styles.bold}>{log.workingMs>0 ? `${Math.floor(log.workingMs/3600000)}h ${Math.floor((log.workingMs%3600000)/60000)}m` : log.loginTime ? calcWorkingHours(log.loginTime,log.logoutTime) : '—'}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      )}

      {/* EOD Tab */}
      {activeTab === 'eod' && (
        <div className={styles.eodList}>
          {eods.length === 0
            ? <div className={styles.emptyState}>No EOD reports yet</div>
            : eods.map(eod=>(
              <div key={eod._id} className={styles.eodCard}>
                <div className={styles.eodDate}>{formatDate(eod.date)}</div>
                <div className={styles.eodSections}>
                  {eod.projects?.length>0&&<div><div className={styles.eodTitle}>Projects</div><ul className={styles.eodUl}>{eod.projects.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
                  {eod.completed?.length>0&&<div><div className={styles.eodTitle}>Completed</div><ul className={styles.eodUl}>{eod.completed.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
                  {eod.planned?.length>0&&<div><div className={styles.eodTitle}>Planned</div><ul className={styles.eodUl}>{eod.planned.map((p,i)=><li key={i}>{p}</li>)}</ul></div>}
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}