import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BuildingIcon } from '../components/Icons';
import api from '../utils/api';
import styles from './LoginPage.module.css';
import regStyles from './RegisterPage.module.css';

export default function RegisterPage() {
  const { login }  = useAuth();
  const toast      = useToast();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('All fields are required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      await login(form.email, form.password);
      toast.success(`Welcome to TeamPulse, ${form.name}!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Brand */}
        <div className={styles.brand}>
          <div className={styles.logoWrap}>
            <BuildingIcon size={22} color="#fff" />
          </div>
          <h1>Create Account</h1>
          <p>Join your team on TeamPulse</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="e.g. Alice Johnson"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className={styles.field}>
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label>Password <span style={{color:'#AAB7C4',fontWeight:400}}>(min 6 characters)</span></label>
            <div className={styles.passWrap}>
              <input
                type={showPass ? 'text' : 'password'}
                name="password"
                placeholder="Create a strong password"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                {showPass ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
          </div>

          {/* Password strength bar */}
          {form.password.length > 0 && (
            <div className={regStyles.strengthWrap}>
              <div className={regStyles.strengthBar}>
                <div
                  className={regStyles.strengthFill}
                  style={{
                    width: form.password.length >= 10 ? '100%' : form.password.length >= 6 ? '60%' : '25%',
                    background: form.password.length >= 10 ? '#28C76F' : form.password.length >= 6 ? '#FF9F43' : '#EA5455',
                  }}
                />
              </div>
              <span className={regStyles.strengthLabel}>
                {form.password.length >= 10 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Weak'}
              </span>
            </div>
          )}

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? <Spinner /> : 'Create Account'}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ── Inline mini icons ──
const EyeOn = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const Spinner = () => (
  <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
    <span style={{width:16,height:16,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',animation:'spin 0.7s linear infinite',display:'inline-block'}}/>
    Creating account…
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </span>
);