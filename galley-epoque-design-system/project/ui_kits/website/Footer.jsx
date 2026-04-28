// Footer.jsx — Galley Epoque site footer

const Footer = ({ onNavigate }) => (
  <footer style={footerStyles.footer}>
    <div style={footerStyles.inner}>
      <div style={footerStyles.brand}>
        <div style={footerStyles.logo}>
          <div style={footerStyles.mark}><div style={footerStyles.markInner}></div></div>
          <div style={footerStyles.rule}></div>
          <div>
            <div style={footerStyles.wordmark}>GALLEY</div>
            <div style={footerStyles.submark}>Époque</div>
          </div>
        </div>
        <p style={footerStyles.tagline}>Curated with intention.<br />Available for your walls.</p>
      </div>
      <div style={footerStyles.links}>
        <div style={footerStyles.colTitle}>Navigate</div>
        {['Gallery', 'Exhibitions', 'Artists', 'About', 'Contact'].map(l => (
          <a key={l} href="#" onClick={e => { e.preventDefault(); onNavigate(l.toLowerCase()); }} style={footerStyles.link}>{l}</a>
        ))}
      </div>
      <div style={footerStyles.links}>
        <div style={footerStyles.colTitle}>Information</div>
        {['Purchase Terms', 'Shipping', 'Returns', 'Privacy Policy'].map(l => (
          <a key={l} href="#" style={footerStyles.link}>{l}</a>
        ))}
      </div>
      <div style={footerStyles.links}>
        <div style={footerStyles.colTitle}>Contact</div>
        <p style={footerStyles.addr}>gallery@galleyepoque.com</p>
        <p style={footerStyles.addr}>+33 1 42 00 00 00</p>
        <p style={{...footerStyles.addr, marginTop: '12px'}}>12 Rue des Beaux-Arts<br />Paris, France</p>
      </div>
    </div>
    <div style={footerStyles.bottom}>
      <span style={footerStyles.copy}>© 2024 Galley Époque. All rights reserved.</span>
      <span style={footerStyles.copy}>Original works. Signed and certified.</span>
    </div>
  </footer>
);

const footerStyles = {
  footer: { background: '#1A4D2E', color: 'white', padding: '64px 0 0' },
  inner: { maxWidth: '1280px', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', paddingBottom: '48px', borderBottom: '1px solid rgba(255,255,255,0.12)' },
  brand: { display: 'flex', flexDirection: 'column', gap: '20px' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px' },
  mark: { width: '34px', height: '34px', border: '2.5px solid rgba(255,255,255,0.8)', borderRadius: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  markInner: { width: '22px', height: '22px', border: '1.5px solid rgba(255,255,255,0.6)', borderRadius: '0.5px' },
  rule: { width: '1px', height: '26px', background: '#C9A84C', margin: '0 4px' },
  wordmark: { fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, color: 'white', letterSpacing: '0.18em', lineHeight: 1 },
  submark: { fontFamily: "'Cormorant Garamond', serif", fontSize: '12px', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.3em', lineHeight: 1, marginTop: '3px' },
  tagline: { fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontStyle: 'italic', fontWeight: 300, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65 },
  colTitle: { fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: '16px' },
  links: { display: 'flex', flexDirection: 'column', gap: '8px' },
  link: { fontFamily: "'Jost', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', cursor: 'pointer' },
  addr: { fontFamily: "'Jost', sans-serif", fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 },
  bottom: { maxWidth: '1280px', margin: '0 auto', padding: '20px 40px', display: 'flex', justifyContent: 'space-between' },
  copy: { fontFamily: "'Jost', sans-serif", fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em' },
};

Object.assign(window, { Footer });
