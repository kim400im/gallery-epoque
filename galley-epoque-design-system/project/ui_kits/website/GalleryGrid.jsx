// GalleryGrid.jsx — Filterable gallery grid

const WORKS = [
  { id: 1, title: 'Coastal Light, No. 4', medium: 'Photography', catalog: 'GE-2024-0047', price: '€ 1,200', dimensions: '60×90 cm', bg: 'linear-gradient(135deg,#4A7C59,#1A4D2E)', featured: true, status: 'available' },
  { id: 2, title: 'Golden Hour Study', medium: 'Painting', catalog: 'GE-2024-0031', price: '€ 3,400', dimensions: '80×100 cm', bg: 'linear-gradient(160deg,#C9A84C,#8B6B1A)', featured: false, status: 'available' },
  { id: 3, title: 'Evening Silence', medium: 'Painting', catalog: 'GE-2023-0019', price: '€ 2,100', dimensions: '50×70 cm', bg: 'linear-gradient(135deg,#8C8679,#3A3A37)', featured: false, status: 'sold' },
  { id: 4, title: 'After the Rain', medium: 'Photography', catalog: 'GE-2024-0052', price: '€ 900', dimensions: '40×60 cm', bg: 'linear-gradient(160deg,#6A9E78,#235E39)', featured: false, status: 'available' },
  { id: 5, title: 'Urban Geometry III', medium: 'Print', catalog: 'GE-2024-0038', price: '€ 650', dimensions: '50×50 cm', bg: 'linear-gradient(135deg,#5C5750,#1A1A18)', featured: false, status: 'available' },
  { id: 6, title: 'Blossom Meditation', medium: 'Painting', catalog: 'GE-2024-0044', price: '€ 4,800', dimensions: '100×120 cm', bg: 'linear-gradient(135deg,#A8C99A,#4A7C59)', featured: false, status: 'available' },
  { id: 7, title: 'Still Life, Sunday', medium: 'Photography', catalog: 'GE-2023-0061', price: '€ 780', dimensions: '30×40 cm', bg: 'linear-gradient(160deg,#E2C97A,#C9A84C)', featured: false, status: 'available' },
  { id: 8, title: 'Forest Floor Study', medium: 'Print', catalog: 'GE-2024-0029', price: '€ 450', dimensions: '40×40 cm', bg: 'linear-gradient(135deg,#D4E8CB,#7FB069)', featured: false, status: 'available' },
];

const FILTERS = ['All', 'Photography', 'Painting', 'Print'];

const GalleryGrid = ({ onArtworkClick }) => {
  const [filter, setFilter] = React.useState('All');
  const filtered = filter === 'All' ? WORKS : WORKS.filter(w => w.medium === filter);

  return (
    <section style={gridStyles.section}>
      <div style={gridStyles.inner}>
        {/* Section header */}
        <div style={gridStyles.header}>
          <div>
            <div style={gridStyles.overline}>Current Collection</div>
            <h2 style={gridStyles.h2}>All Works</h2>
          </div>
          {/* Filters */}
          <div style={gridStyles.filters}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{ ...gridStyles.filterBtn, ...(filter === f ? gridStyles.filterActive : {}) }}
              >{f}</button>
            ))}
          </div>
        </div>
        {/* Grid */}
        <div style={gridStyles.grid}>
          {filtered.map(work => (
            <ArtworkCard key={work.id} work={work} onClick={onArtworkClick} />
          ))}
        </div>
      </div>
    </section>
  );
};

const gridStyles = {
  section: { padding: '80px 0', background: '#F7F4EF' },
  inner: { maxWidth: '1280px', margin: '0 auto', padding: '0 40px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' },
  overline: { fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8C8679', marginBottom: '8px' },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 300, color: '#1A1A18', lineHeight: 1.1, letterSpacing: '-0.01em' },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: { fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', background: 'transparent', color: '#8C8679', border: '1px solid #E0DDD7', padding: '8px 16px', borderRadius: '2px', cursor: 'pointer' },
  filterActive: { background: '#1A4D2E', color: 'white', borderColor: '#1A4D2E' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
};

Object.assign(window, { GalleryGrid, WORKS });
