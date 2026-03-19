import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const icons = {
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  warn: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  '': (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  ),
};

const toastColors = {
  success: { bg: '#28C76F', light: 'rgba(40,199,111,0.12)' },
  error:   { bg: '#EA5455', light: 'rgba(234,84,85,0.12)'  },
  warn:    { bg: '#FF9F43', light: 'rgba(255,159,67,0.12)' },
  '':      { bg: '#1F3A63', light: 'rgba(31,58,99,0.12)'   },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = '') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800);
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    warn:    (msg) => addToast(msg, 'warn'),
    info:    (msg) => addToast(msg, ''),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{ position:'fixed', bottom:28, right:28, zIndex:999, display:'flex', flexDirection:'column', gap:10 }}>
        {toasts.map((t) => {
          const col = toastColors[t.type] || toastColors[''];
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fff',
              borderLeft: `4px solid ${col.bg}`,
              padding: '12px 18px 12px 14px',
              borderRadius: 10,
              boxShadow: '0 8px 32px rgba(31,58,99,0.14)',
              maxWidth: 340,
              animation: 'toastIn 0.25s ease',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.83rem',
              color: '#2C3E50',
            }}>
              <span style={{
                width: 30, height: 30, borderRadius: 8,
                background: col.light,
                display: 'grid', placeItems: 'center',
                color: col.bg, flexShrink: 0,
              }}>
                {icons[t.type]}
              </span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
