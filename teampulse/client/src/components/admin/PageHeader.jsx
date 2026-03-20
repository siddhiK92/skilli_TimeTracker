export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:22, gap:16 }}>
      <div>
        <h1 style={{ fontSize:'1.2rem', fontWeight:700, color:'var(--text-primary)', letterSpacing:'-0.3px' }}>{title}</h1>
        {subtitle && <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:4 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink:0 }}>{action}</div>}
    </div>
  );
}