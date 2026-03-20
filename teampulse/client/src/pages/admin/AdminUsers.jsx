import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { getInitials, calcWorkingHours } from '../../utils/helpers';
import styles from './AdminUsers.module.css';

export default function AdminUsers() {
  const toast = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}?`)) return;
    try { await api.delete(`/admin/users/${u._id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleToggle = async (u) => {
    try {
      await api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive });
      toast.success(u.isActive ? 'Deactivated' : 'Activated');
      load();
    } catch { toast.error('Failed'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.role||'').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.sub}>{users.length} total members</p>
        </div>
      </div>

      <input className={styles.search} placeholder="Search by name or role…"
        value={search} onChange={e => setSearch(e.target.value)} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr>
            <th>Member</th><th>Status</th><th>Working Today</th>
            <th>Account</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className={styles.center}>Loading…</td></tr>
            : filtered.map(u => (
              <tr key={u._id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar} style={{background: u.color||'#7367F0'}}>{getInitials(u.name)}</div>
                    <div>
                      <div className={styles.name}>{u.name}</div>
                      <div className={styles.role}>{u.username} · {u.role||'Team Member'}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${u.status==='online'?styles.online:u.status==='leave'?styles.leave:styles.offline}`}>
                    {u.status}
                  </span>
                </td>
                <td className={styles.hours}>{u.loginTime ? calcWorkingHours(u.loginTime, u.logoutTime) : '—'}</td>
                <td>
                  <span className={`${styles.badge} ${u.isActive?styles.online:styles.offline}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button className={styles.btnView} onClick={() => navigate(`/admin/users/${u._id}`)}>View</button>
                    <button className={`${styles.btnToggle} ${u.isActive?styles.btnDeact:styles.btnAct}`} onClick={() => handleToggle(u)}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className={styles.btnDel} onClick={() => handleDelete(u)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}