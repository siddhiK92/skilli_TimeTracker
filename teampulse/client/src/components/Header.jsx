import { Link } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getInitials, getAvatarColor } from '../utils/helpers';
import { BuildingIcon, LogOutIcon, UmbrellaIcon, WifiIcon, ShieldIcon } from './Icons';
import styles from './Header.module.css';

export default function Header({ onToggleLeave }) {
  const { user, logout, isAdmin } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try { await logout(); toast.info('Punch-out recorded. Goodbye!'); }
    catch { toast.error('Logout failed'); }
  };

  const isOnLeave = user?.status === 'leave';

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <BuildingIcon size={20} color="#fff" strokeWidth={1.8} />
        </div>
        <span>TimeTracker</span>
      </div>

      <div className={styles.right}>
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.avatar}
              style={{ background: user.color || getAvatarColor(user.name) }}>
              {getInitials(user.name)}
            </div>
            <div>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role || 'Team Member'}</div>
            </div>
          </div>
        )}

        {isAdmin && (
          <Link to="/admin" className={`${styles.btn} ${styles.btnAdmin}`}>
            <ShieldIcon size={15} color="#fff" />
            Admin Panel
          </Link>
        )}

        <button
          className={`${styles.btn} ${isOnLeave ? styles.btnOnline : styles.btnLeave}`}
          onClick={onToggleLeave}
        >
          {isOnLeave
            ? <><WifiIcon size={15} color="#fff" /> Back Online</>
            : <><UmbrellaIcon size={15} color="#fff" /> On Leave</>
          }
        </button>

        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={handleLogout}>
          <LogOutIcon size={15} color="#fff" />
          Punch Out
        </button>
      </div>
    </header>
  );
}