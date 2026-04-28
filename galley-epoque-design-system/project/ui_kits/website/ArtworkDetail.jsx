// ArtworkDetail.jsx — Artwork detail overlay / lightbox

const ArtworkDetail = ({ work, onClose, onContact }) => {
  React.useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!work) return null;

  return (
    <div style={detailStyles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={detailStyles.panel}>
        {/* Close */}
        <button style={detailStyles.closeBtn} onClick={onClose}>✕</button>
        <div style={detailStyles.layout}>
          {/* Artwork image */}
          <div style={detailStyles.imgCol}>
            <div style={detailStyles.mat}>
              <div style={{ ...detailStyles.img, background: work.bg }}></div>
            </div>
            <p style={detailStyles.imgCaption}>{work.title} — {work.dimensions}</p>
          </div>
          {/* Info */}
          <div style={detailStyles.infoCol}>
            <div style={detailStyles.overline}>{work.medium}</div>
            <h2 style={detailStyles.title}>{work.title}</h2>
            <div style={detailStyles.catalog}>{work.catalog}</div>
            <div style={detailStyles.divider}></div>
            <div style={detailStyles.metaGrid}>
              <span style={detailStyles.metaLabel}>Medium</span>
              <span style={detailStyles.metaValue}>{work.medium}</span>
              <span style={detailStyles.metaLabel}>Dimensions</span>
              <span style={detailStyles.metaValue}>{work.dimensions}</span>
              <span style={detailStyles.metaLabel}>Year</span>
              <span style={detailStyles.metaValue}>2024</span>
              <span style={detailStyles.metaLabel}>Edition</span>
              <span style={detailStyles.metaValue}>Original, 1 of 1</span>
            </div>
            <div style={detailStyles.divider}></div>
            <div style={detailStyles.price}>
              {work.status === 'sold' ? (
                <span style={{ color: '#C4BFB8' }}>This work has been sold.</span>
              ) : work.price}
            </div>
            {work.status !== 'sold' && (
              <div style={detailStyles.actions}>
                <button style={detailStyles.btnBuy} onClick={onContact}>Enquire to Buy</button>
                <button style={detailStyles.btnContact} onClick={onContact}>Contact Gallery</button>
              </div>
            )}
            <p style={detailStyles.note}>All works are certified original and include a signed certificate of authenticity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const detailStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(26,26,24,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', backdropFilter: 'blur(4px)' },
  panel: { background: 'white', borderRadius: '2px', maxWidth: '960px', width: '100%', maxHeight: '90vh', overflow: 'auto', position: 'relative', boxShadow: '0 24px 64px rgba(26,26,24,0.22)' },
  closeBtn: { position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: '1px solid #E0DDD7', color: '#8C8679', width: '36px', height: '36px', borderRadius: '2px', cursor: 'pointer', fontSize: '14px', zIndex: 1 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' },
  imgCol: { padding: '40px 32px 40px 40px', background: '#F7F4EF', display: 'flex', flexDirection: 'column', gap: '12px' },
  mat: { background: 'white', padding: '16px', boxShadow: '0 2px 8px rgba(26,26,24,0.08)', borderRadius: '1px' },
  img: { width: '100%', aspectRatio: '4/3', borderRadius: '1px' },
  imgCaption: { fontFamily: "'Jost', sans-serif", fontSize: '11px', color: '#C4BFB8', letterSpacing: '0.04em', textAlign: 'center' },
  infoCol: { padding: '40px 40px 40px 32px', display: 'flex', flexDirection: 'column' },
  overline: { fontFamily: "'Jost', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8C8679', marginBottom: '8px' },
  title: { fontFamily: "'Cormorant Garamond', serif", fontSize: '32px', fontWeight: 400, fontStyle: 'italic', color: '#1A1A18', lineHeight: 1.2, marginBottom: '6px' },
  catalog: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#C4BFB8', letterSpacing: '0.04em', marginBottom: '0' },
  divider: { height: '1px', background: '#E0DDD7', margin: '20px 0' },
  metaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px' },
  metaLabel: { fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8C8679' },
  metaValue: { fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#1A1A18' },
  price: { fontFamily: "'Jost', sans-serif", fontSize: '28px', fontWeight: 500, color: '#C9A84C', marginBottom: '20px' },
  actions: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  btnBuy: { fontFamily: "'Jost', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#C9A84C', color: '#1A1A18', border: 'none', padding: '14px', borderRadius: '2px', cursor: 'pointer' },
  btnContact: { fontFamily: "'Jost', sans-serif", fontSize: '13px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'transparent', color: '#1A4D2E', border: '1.5px solid #1A4D2E', padding: '13px', borderRadius: '2px', cursor: 'pointer' },
  note: { fontFamily: "'Jost', sans-serif", fontSize: '12px', color: '#C4BFB8', lineHeight: 1.6, marginTop: 'auto' },
};

Object.assign(window, { ArtworkDetail });
