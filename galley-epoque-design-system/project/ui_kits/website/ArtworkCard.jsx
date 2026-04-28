// ArtworkCard.jsx — Individual artwork card component

const ArtworkCard = ({ work, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{ ...cardStyles.card, boxShadow: hovered ? '0 8px 24px rgba(26,26,24,0.14)' : '0 2px 8px rgba(26,26,24,0.08)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(work)}
    >
      {/* Image mat */}
      <div style={cardStyles.mat}>
        <div style={cardStyles.imgWrap}>
          <div style={{ ...cardStyles.img, background: work.bg, transform: hovered ? 'scale(1.04)' : 'scale(1)' }}></div>
          {work.status === 'sold' && (
            <div style={cardStyles.soldBadge}>Sold</div>
          )}
          {work.featured && (
            <div style={cardStyles.featuredBadge}>Featured</div>
          )}
        </div>
      </div>
      {/* Info */}
      <div style={cardStyles.body}>
        <div style={cardStyles.overline}>{work.medium}</div>
        <div style={cardStyles.title}>{work.title}</div>
        <div style={cardStyles.catalog}>{work.catalog}</div>
        <div style={cardStyles.footer}>
          <span style={{ ...cardStyles.price, color: work.status === 'sold' ? '#C4BFB8' : '#C9A84C' }}>
            {work.status === 'sold' ? 'Sold' : work.price}
          </span>
          {work.dimensions && <span style={cardStyles.dims}>{work.dimensions}</span>}
        </div>
      </div>
      {work.featured && <div style={cardStyles.goldBorder}></div>}
    </div>
  );
};

const cardStyles = {
  card: { background: 'white', borderRadius: '2px', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 300ms cubic-bezier(0.25,0.46,0.45,0.94)', position: 'relative' },
  mat: { padding: '12px 12px 0', background: 'white' },
  imgWrap: { position: 'relative', overflow: 'hidden', borderRadius: '1px' },
  img: { width: '100%', height: '220px', transition: 'transform 400ms cubic-bezier(0.25,0.46,0.45,0.94)', borderRadius: '1px' },
  soldBadge: { position: 'absolute', top: '10px', right: '10px', background: 'rgba(26,26,24,0.75)', color: 'white', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '999px', fontFamily: "'Jost', sans-serif" },
  featuredBadge: { position: 'absolute', top: '10px', left: '10px', background: '#C9A84C', color: '#1A1A18', fontSize: '9px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 8px', borderRadius: '999px', fontFamily: "'Jost', sans-serif" },
  body: { padding: '14px 16px 16px' },
  overline: { fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8C8679', marginBottom: '4px' },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontStyle: 'italic', color: '#1A1A18', lineHeight: 1.3, marginBottom: '4px' },
  catalog: { fontFamily: "'JetBrains Mono', 'Courier New', monospace", fontSize: '10px', color: '#C4BFB8', letterSpacing: '0.04em', marginBottom: '10px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
  price: { fontFamily: "'Jost', sans-serif", fontSize: '15px', fontWeight: 500 },
  dims: { fontFamily: "'Jost', sans-serif", fontSize: '11px', color: '#C4BFB8' },
  goldBorder: { position: 'absolute', inset: 0, border: '1px solid #C9A84C', borderRadius: '2px', pointerEvents: 'none' },
};

Object.assign(window, { ArtworkCard });
