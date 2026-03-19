import { UsersIcon, WifiIcon, WifiOffIcon, UmbrellaIcon } from './Icons';
import styles from './StatsRow.module.css';

const getStats = (users) => [
  {
    icon: <UsersIcon size={22} color="#7367F0" />,
    label: 'Total Members',
    value: users.length,
    bg: 'rgba(115,103,240,0.12)',
  },
  {
    icon: <WifiIcon size={22} color="#28C76F" />,
    label: 'Online Now',
    value: users.filter((u) => u.status === 'online').length,
    bg: 'rgba(40,199,111,0.12)',
  },
  {
    icon: <WifiOffIcon size={22} color="#EA5455" />,
    label: 'Offline',
    value: users.filter((u) => u.status === 'offline').length,
    bg: 'rgba(234,84,85,0.1)',
  },
  {
    icon: <UmbrellaIcon size={22} color="#FF9F43" />,
    label: 'On Leave',
    value: users.filter((u) => u.status === 'leave').length,
    bg: 'rgba(255,159,67,0.12)',
  },
];

export default function StatsRow({ users }) {
  return (
    <div className={styles.row}>
      {getStats(users).map((s) => (
        <div key={s.label} className={styles.card}>
          <div className={styles.icon} style={{ background: s.bg }}>
            {s.icon}
          </div>
          <div>
            <div className={styles.num}>{s.value}</div>
            <div className={styles.label}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
