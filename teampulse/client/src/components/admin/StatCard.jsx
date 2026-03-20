export default function StatCard({ icon, label, value, bg }) {
  return (
    <div style={{ background:'var(--white)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'18px 20px', display:'flex', alignItems:'center', gap:14, boxShadow:'var(--shadow)' }}>
      <div style={{ width:44, height:44, borderRadius:11, background:bg, display:'grid', placeItems:'center', flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text-primary)', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:'0.73rem', color:'var(--text-secondary)', marginTop:4, fontWeight:500 }}>{label}</div>
      </div>
    </div>
  );
}