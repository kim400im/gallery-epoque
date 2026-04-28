// Header.jsx — Galley Epoque sticky navigation

const Header = ({ currentScreen, onNavigate }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const links = ['Gallery', 'Exhibitions', 'Artists', 'Announcements', 'About'];

  return (
    <header style={headerStyles.header}>
      <div style={headerStyles.inner}>
        {/* Logo */}
        <div style={headerStyles.logo} onClick={() => onNavigate('home')} role="button">
          <div style={headerStyles.mark}>
            <div style={headerStyles.markInner}></div>
          </div>
          <div style={headerStyles.rule}></div>
          <div>
            <div style={headerStyles.wordmark}>GALLEY</div>
            <div style={headerStyles.submark}>Époque</div>
          </div>
        </div>

        {/* Desktop nav */}
        <nav style={headerStyles.nav}>
          {links.map(link => (
            <a
              key={link}
              href="#"
              onClick={e => { e.preventDefault(); onNavigate(link.toLowerCase()); }}
              style={{
                ...headerStyles.navLink,
                ...(currentScreen === link.toLowerCase() ? headerStyles.navLinkActive : {}),
              }}
            >
              {link}
              {currentScreen === link.toLowerCase() && <span style={headerStyles.activeDot}></span>}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <button style={headerStyles.cta} onClick={() => onNavigate('contact')}>
          Enquire
        </button>
      </div>
    </header>
  );
};

const headerStyles = {
  header: { position: 'sticky', top: 0, zIndex: 100, background: '#FFFFFF', borderBottom: '1px solid #E0DDD7', height: '72px', display: 'flex', alignItems: 'center' },
  inner: { maxWidth: '1280px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
  mark: { width: '34px', height: '34px', border: '2.5px solid #1A4D2E', borderRadius: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  markInner: { width: '22px', height: '22px', border: '1.5px solid #1A4D2E', borderRadius: '0.5px' },
  rule: { width: '1px', height: '26px', background: '#C9A84C', margin: '0 4px' },
  wordmark: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '18px', fontWeight: 300, color: '#1A4D2E', letterSpacing: '0.18em', lineHeight: 1 },
  submark: { fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: '12px', fontWeight: 300, fontStyle: 'italic', color: '#1A4D2E', letterSpacing: '0.3em', lineHeight: 1, marginTop: '3px' },
  nav: { display: 'flex', gap: '36px', alignItems: 'center' },
  navLink: { fontFamily: "'Jost', sans-serif", fontSize: '13px', fontWeight: 500, color: '#5C5750', letterSpacing: '0.04em', textDecoration: 'none', position: 'relative', paddingBottom: '2px', cursor: 'pointer' },
  navLinkActive: { color: '#1A4D2E' },
  activeDot: { position: 'absolute', bottom: '-4px', left: 0, right: 0, height: '1.5px', background: '#1A4D2E', display: 'block' },
  cta: { fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1A4D2E', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '2px', cursor: 'pointer' },
};

Object.assign(window, { Header });
