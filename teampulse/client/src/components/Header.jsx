import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getInitials, getAvatarColor } from '../utils/helpers';
import { BuildingIcon, LogOutIcon, UmbrellaIcon, WifiIcon } from './Icons';
import styles from './Header.module.css';

export default function Header({ onToggleLeave }) {
  const { user, logout } = useAuth();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.info('Punch-out recorded. Goodbye!');
    } catch {
      toast.error('Logout failed');
    }
  };

  const isOnLeave = user?.status === 'leave';

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <BuildingIcon size={18} color="#fff" strokeWidth={1.8} />
        </div>
        <span>TimeTracker</span>
      </div>

      <div className={styles.right}>
        {user && (
          <div className={styles.userInfo}>
            <div
              className={styles.avatar}
              style={{ background: user.color || getAvatarColor(user.name) }}
            >
              {getInitials(user.name)}
            </div>
            <div className="hide-mobile">
              <div className={styles.userName}>{user.name}</div>
            </div>
          </div>
        )}

        <button
          className={`btn btn-sm ${isOnLeave ? 'btn-success' : 'btn-leave'}`}
          onClick={onToggleLeave}
        >
          {isOnLeave
            ? <><WifiIcon size={14} color="#fff" />&nbsp;Back Online</>
            : <><UmbrellaIcon size={14} color="#fff" />&nbsp;On Leave</>
          }
        </button>

        <button className="btn btn-danger btn-sm" onClick={handleLogout}>
          <LogOutIcon size={14} color="#fff" />
          &nbsp;Punch Out
        </button>
      </div>
    </header>
  );
}
