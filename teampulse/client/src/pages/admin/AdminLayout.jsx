import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/helpers';
import styles from './AdminLayout.module.css';

const NAV = [
  { to: '/admin',            label: 'Overview',    end: true },
  { to: '/admin/users',      label: 'Users'               },
  { to: '/admin/attendance', label: 'Attendance'          },
  { to: '/admin/eod',        label: 'EOD Reports'         },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try { await logout(); navigate('/login'); toast.info('Logged out'); }
    catch { toast.error('Logout failed'); }
  };

  return (
    <div className={styles.layout}>
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>TP</div>
            <div>
              <div className={styles.brandName}>TeamPulse</div>
              <div className={styles.brandSub}>Admin Panel</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
        </div>

        <nav className={styles.nav}>
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              onClick={() => setOpen(false)}>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminAvatar} style={{ background: user?.color || '#7367F0' }}>
            {getInitials(user?.name || 'A')}
          </div>
          <div className={styles.adminInfo}>
            <div className={styles.adminName}>{user?.name}</div>
            <div className={styles.adminRole}>Administrator</div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">⇥</button>
        </div>
      </aside>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <main className={styles.main}>
        <div className={styles.topbar}>
          <button className={styles.menuBtn} onClick={() => setOpen(true)}>☰</button>
          <span className={styles.topbarTitle}>Admin Panel</span>
        </div>
        <div className={styles.content}><Outlet /></div>
      </main>
    </div>
  );
}