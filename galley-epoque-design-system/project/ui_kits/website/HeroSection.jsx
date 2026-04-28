// HeroSection.jsx — Full-bleed hero slideshow

const SLIDE_DATA = [
  {
    id: 1,
    title: 'The Art of Seeing',
    subtitle: 'Spring Collection · 2024',
    lead: 'Original works, curated with intention.',
    bg: `radial-gradient(ellipse at 30% 60%, #2E7048 0%, #1A4D2E 40%, #0E2D1A 100%)`,
    accent: `
      radial-gradient(circle at 70% 30%, rgba(201,168,76,0.18) 0%, transparent 55%),
      radial-gradient(circle at 20% 80%, rgba(127,176,105,0.15) 0%, transparent 45%)
    `,
    art: 'photography',
  },
  {
    id: 2,
    title: 'Golden Hour',
    subtitle: 'Featured Work · Luca Ferretti',
    lead: 'Painting light as it falls across memory.',
    bg: `radial-gradient(ellipse at 60% 40%, #C9A84C 0%, #8B6B1A 50%, #3A2A08 100%)`,
    accent: `
      radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139,107,26,0.4) 0%, transparent 45%)
    `,
    art: 'painting',
  },
  {
    id: 3,
    title: 'Coastal Light',
    subtitle: 'Photography · Sophie Marchand',
    lead: 'A moment held still in silver and salt.',
    bg: `linear-gradient(160deg, #8FB8C8 0%, #4A7899 35%, #2A4D66 70%, #1A2E40 100%)`,
    accent: `
      radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 60%),
      radial-gradient(circle at 80% 90%, rgba(26,77,46,0.3) 0%, transparent 50%)
    `,
    art: 'photography',
  },
  {
    id: 4,
    title: 'Forest Floor Study',
    subtitle: 'Print · Yuna Park',
    lead: 'Pattern emerging from the natural world.',
    bg: `radial-gradient(ellipse at 40% 70%, #3D6B43 0%, #1A4D2E 45%, #0A1F0F 100%)`,
    accent: `
      radial-gradient(circle at 75% 25%, rgba(164,200,154,0.2) 0%, transparent 45%),
      radial-gradient(circle at 15% 60%, rgba(201,168,76,0.1) 0%, transparent 40%)
    `,
    art: 'print',
  },
  {
    id: 5,
    title: 'Evening Silence',
    subtitle: 'Painting · 2023',
    lead: 'The hour when light stops and colour begins.',
    bg: `linear-gradient(140deg, #3A3360 0%, #1E1A3A 40%, #0D0B1A 100%)`,
    accent: `
      radial-gradient(circle at 65% 35%, rgba(201,168,76,0.15) 0%, transparent 50%),
      radial-gradient(circle at 30% 70%, rgba(127,176,105,0.1) 0%, transparent 40%)
    `,
    art: 'painting',
  },
];

// Art shape overlays — abstract SVG silhouettes to suggest real artwork
const ArtOverlay = ({ type }) => {
  if (type === 'photography') return (
    <svg style={{ position:'absolute', right:'8%', bottom:'10%', opacity:0.07, width:'340px', height:'340px' }} viewBox="0 0 200 200">
      <rect x="10" y="10" width="180" height="180" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
      <rect x="25" y="25" width="150" height="150" rx="0.5" stroke="white" strokeWidth="0.75" fill="none"/>
      <circle cx="100" cy="100" r="45" stroke="white" strokeWidth="1" fill="none"/>
      <line x1="10" y1="100" x2="190" y2="100" stroke="white" strokeWidth="0.5"/>
      <line x1="100" y1="10" x2="100" y2="190" stroke="white" strokeWidth="0.5"/>
    </svg>
  );
  if (type === 'painting') return (
    <svg style={{ position:'absolute', right:'6%', bottom:'8%', opacity:0.07, width:'300px', height:'380px' }} viewBox="0 0 150 200">
      <rect x="10" y="10" width="130" height="180" rx="1" stroke="white" strokeWidth="1.5" fill="none"/>
      <path d="M25 150 Q60 80 90 120 Q120 160 140 90" stroke="white" strokeWidth="1" fill="none"/>
      <ellipse cx="75" cy="70" rx="30" ry="22" stroke="white" strokeWidth="0.75" fill="none"/>
    </svg>
  );
  return (
    <svg style={{ position:'absolute', right:'6%', bottom:'8%', opacity:0.07, width:'320px', height:'320px' }} viewBox="0 0 160 160">
      <rect x="10" y="10" width="140" height="140" rx="0.5" stroke="white" strokeWidth="1.5" fill="none"/>
      {[0,1,2,3,4].map(i => <line key={i} x1="10" y1={38+i*22} x2="150" y2={38+i*22} stroke="white" strokeWidth="0.4"/>)}
      {[0,1,2,3,4].map(i => <line key={i} x1={38+i*22} y1="10" x2={38+i*22} y2="150" stroke="white" strokeWidth="0.4"/>)}
      <rect x="52" y="52" width="56" height="56" stroke="white" strokeWidth="1" fill="rgba(255,255,255,0.04)"/>
    </svg>
  );
};

const HeroSection = ({ onNavigate }) => {
  const [current, setCurrent] = React.useState(0);
  const [prev, setPrev]       = React.useState(null);
  const [transitioning, setTransitioning] = React.useState(false);
  const slides = window.__heroSlides || SLIDE_DATA;
  const total  = slides.length;

  const goTo = React.useCallback((idx) => {
    if (transitioning || idx === current) return;
    setPrev(current);
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(idx);
      setPrev(null);
      setTransitioning(false);
    }, 600);
  }, [current, transitioning]);

  // Auto-advance
  React.useEffect(() => {
    const timer = setInterval(() => {
      const next = (current + 1) % total;
      goTo(next);
    }, 5500);
    return () => clearInterval(timer);
  }, [current, total, goTo]);

  const slide = slides[current];

  return (
    <section style={{ position:'relative', height:'92vh', minHeight:'580px', overflow:'hidden' }}>
      {/* Slides */}
      {slides.map((s, i) => (
        <div key={s.id} style={{
          position:'absolute', inset:0,
          background: s.bg,
          opacity: i === current ? 1 : 0,
          transition: 'opacity 800ms cubic-bezier(0.25,0.46,0.45,0.94)',
          pointerEvents: i === current ? 'auto' : 'none',
        }}>
          {/* Accent overlay */}
          <div style={{ position:'absolute', inset:0, background: s.accent }}></div>
          {/* Noise texture */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', opacity:0.04 }}></div>
          {/* Dark vignette for text legibility */}
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }}></div>
          <ArtOverlay type={s.art} />
        </div>
      ))}

      {/* Content */}
      <div style={{ position:'relative', zIndex:10, maxWidth:'1280px', margin:'0 auto', padding:'0 48px', height:'100%', display:'flex', alignItems:'center' }}>
        <div key={current} style={{ animation:'heroFadeUp 0.7s cubic-bezier(0.25,0.46,0.45,0.94) both' }}>
          <div style={{ fontSize:'11px', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#C9A84C', marginBottom:'20px' }}>{slide.subtitle}</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(52px,7vw,100px)', fontWeight:300, lineHeight:1.02, letterSpacing:'-0.02em', color:'white', marginBottom:'22px', maxWidth:'700px' }}>{slide.title}</h1>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'20px', fontStyle:'italic', fontWeight:300, color:'rgba(255,255,255,0.65)', lineHeight:1.65, marginBottom:'40px', maxWidth:'400px' }}>{slide.lead}</p>
          <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
            <button style={btnPrimary} onClick={() => onNavigate('gallery')}>View Collection</button>
            <button style={btnGhost}   onClick={() => onNavigate('contact')}>Enquire</button>
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div style={{ position:'absolute', bottom:'36px', left:'50%', transform:'translateX(-50%)', zIndex:10, display:'flex', gap:'10px', alignItems:'center' }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{ width: i===current ? '28px' : '8px', height:'8px', borderRadius:'999px', background: i===current ? '#C9A84C' : 'rgba(255,255,255,0.35)', border:'none', cursor:'pointer', transition:'all 400ms cubic-bezier(0.25,0.46,0.45,0.94)', padding:0 }} />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button onClick={() => goTo((current - 1 + total) % total)}
        style={{ position:'absolute', left:'24px', top:'50%', transform:'translateY(-50%)', zIndex:10, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'white', width:'44px', height:'44px', borderRadius:'2px', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', transition:'background 200ms' }}>‹</button>
      <button onClick={() => goTo((current + 1) % total)}
        style={{ position:'absolute', right:'24px', top:'50%', transform:'translateY(-50%)', zIndex:10, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'white', width:'44px', height:'44px', borderRadius:'2px', fontSize:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)', transition:'background 200ms' }}>›</button>

      {/* Scroll hint */}
      <div style={{ position:'absolute', bottom:'36px', right:'48px', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px' }}>
        <div style={{ width:'1px', height:'36px', background:'rgba(255,255,255,0.25)' }}></div>
        <span style={{ fontFamily:"'Jost',sans-serif", fontSize:'9px', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)' }}>Scroll</span>
      </div>

      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

const btnPrimary = { fontFamily:"'Jost',sans-serif", fontSize:'13px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', background:'white', color:'#1A4D2E', border:'none', padding:'14px 32px', borderRadius:'2px', cursor:'pointer' };
const btnGhost   = { fontFamily:"'Jost',sans-serif", fontSize:'13px', fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', background:'transparent', color:'rgba(255,255,255,0.8)', border:'1.5px solid rgba(255,255,255,0.32)', padding:'13px 28px', borderRadius:'2px', cursor:'pointer' };

Object.assign(window, { HeroSection, SLIDE_DATA });
