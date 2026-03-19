// Format timestamp to readable time
export const formatTime = (ts) => {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

// Format date
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

// Calculate working hours between two timestamps
export const calcWorkingHours = (loginTime, logoutTime) => {
  if (!loginTime) return '—';
  const end  = logoutTime ? new Date(logoutTime) : new Date();
  const diff = end - new Date(loginTime);
  if (diff < 0) return '0h 0m';
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
};

// Get initials from full name
export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

// Today as YYYY-MM-DD in LOCAL timezone (not UTC — avoids date mismatch for IST etc.)
export const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Avatar background colors pool
export const AVATAR_COLORS = [
  '#7367F0', '#28C76F', '#FF9F43', '#EA5455',
  '#00CFE8', '#1F3A63', '#3E5C76', '#9c27b0',
];

export const getAvatarColor = (name = '') => {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
};
