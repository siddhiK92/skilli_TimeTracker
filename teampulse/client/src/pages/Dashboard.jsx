import { useState, useEffect, useCallback } from 'react';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import Header       from '../components/Header';
import StatsRow     from '../components/StatsRow';
import TeamTable    from '../components/TeamTable';
import EODModal     from '../components/EODModal';
import EODViewModal from '../components/EODViewModal';
import { FileTextIcon } from '../components/Icons';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [users,       setUsers]       = useState([]);
  const [todayEODs,   setTodayEODs]   = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showEOD,     setShowEOD]     = useState(false);
  const [eodViewUser, setEodViewUser] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const [usersRes, eodRes] = await Promise.all([
        api.get('/users'),
        api.get('/eod/today'),
      ]);
      setUsers(usersRes.data.users);
      setTodayEODs(eodRes.data.eods);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleToggleLeave = async () => {
    const newStatus = user.status === 'leave' ? 'online' : 'leave';
    try {
      const { data } = await api.patch('/users/status', { status: newStatus });
      updateUser(data.user);
      setUsers((prev) => prev.map((u) => u._id === data.user._id ? data.user : u));
      toast.success(newStatus === 'leave' ? 'Marked as On Leave' : 'Back to Online');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleViewEOD = async (targetUser) => {
    try {
      const { data } = await api.get(`/eod/user/${targetUser._id}`);
      setEodViewUser({ user: targetUser, eods: data.eods });
    } catch {
      toast.error('Failed to load EOD reports');
    }
  };

  const todayEODMap = {};
  todayEODs.forEach((e) => { todayEODMap[e.user._id] = e; });

  const onlineCount  = users.filter(u=>u.status==='online').length;
  const offlineCount = users.filter(u=>u.status==='offline').length;
  const leaveCount   = users.filter(u=>u.status==='leave').length;

  return (
    <div className={styles.page}>
      <Header onToggleLeave={handleToggleLeave} />

      <div className={styles.container}>
        {loadingData ? (
          <div className={styles.loader}>
            <div className={styles.loaderSpinner} />
            Loading dashboard…
          </div>
        ) : (
          <div className="fade-in">
            <StatsRow users={users} />

            <div className={styles.sectionHeader}>
              <div>
                <div className={styles.sectionTitle}>Team Members</div>
                <div className={styles.sectionSub}>
                  {onlineCount} online &nbsp;·&nbsp; {offlineCount} offline &nbsp;·&nbsp; {leaveCount} on leave
                  &nbsp;—&nbsp;
                  {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'short', year:'numeric' })}
                </div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setShowEOD(true)}>
                <FileTextIcon size={14} color="#fff" />
                Submit EOD Report
              </button>
            </div>

            <TeamTable
              users={users}
              currentUser={user}
              todayEODMap={todayEODMap}
              onViewEOD={handleViewEOD}
              onOpenEOD={() => setShowEOD(true)}
            />
          </div>
        )}
      </div>

      {showEOD && (
        <EODModal
          onClose={() => setShowEOD(false)}
          onSaved={() => { fetchDashboard(); setShowEOD(false); }}
        />
      )}

      {eodViewUser && (
        <EODViewModal
          targetUser={eodViewUser.user}
          eods={eodViewUser.eods}
          onClose={() => setEodViewUser(null)}
        />
      )}
    </div>
  );
}
