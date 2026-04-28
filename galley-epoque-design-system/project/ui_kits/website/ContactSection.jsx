// ContactSection.jsx — Enquiry form section

const ContactSection = ({ selectedWork, onBack }) => {
  const [sent, setSent] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', email: '', message: selectedWork ? `I am interested in "${selectedWork.title}" (${selectedWork.catalog}).` : '' });

  const handleSubmit = e => { e.preventDefault(); setSent(true); };

  return (
    <section style={contactStyles.section}>
      <div style={contactStyles.inner}>
        <div style={contactStyles.left}>
          <div style={contactStyles.overline}>Get in Touch</div>
          <h2 style={contactStyles.h2}>Enquire About<br />a Work</h2>
          <p style={contactStyles.body}>We respond to all enquiries within 24 hours. For urgent matters or in-person viewing requests, please call us directly.</p>
          <div style={contactStyles.details}>
            <div style={contactStyles.detailRow}><span style={contactStyles.detailLabel}>Email</span><span style={contactStyles.detailValue}>gallery@galleyepoque.com</span></div>
            <div style={contactStyles.detailRow}><span style={contactStyles.detailLabel}>Phone</span><span style={contactStyles.detailValue}>+33 1 42 00 00 00</span></div>
            <div style={contactStyles.detailRow}><span style={contactStyles.detailLabel}>Location</span><span style={contactStyles.detailValue}>12 Rue des Beaux-Arts, Paris</span></div>
            <div style={contactStyles.detailRow}><span style={contactStyles.detailLabel}>Hours</span><span style={contactStyles.detailValue}>Tue–Sat, 10:00–18:00</span></div>
          </div>
        </div>

        <div style={contactStyles.right}>
          {sent ? (
            <div style={contactStyles.success}>
              <div style={contactStyles.successMark}>✓</div>
              <h3 style={contactStyles.successTitle}>Message received</h3>
              <p style={contactStyles.successBody}>Thank you for your enquiry. We will be in touch within 24 hours.</p>
              <button style={contactStyles.btnBack} onClick={() => { setSent(false); onBack && onBack(); }}>Back to Gallery</button>
            </div>
          ) : (
            <form style={contactStyles.form} onSubmit={handleSubmit}>
              {selectedWork && (
                <div style={contactStyles.workRef}>
                  <div style={contactStyles.workRefImg} style={{ ...contactStyles.workRefImg, background: selectedWork.bg }}></div>
                  <div>
                    <div style={contactStyles.workRefTitle}>{selectedWork.title}</div>
                    <div style={contactStyles.workRefCat}>{selectedWork.catalog} · {selectedWork.price}</div>
                  </div>
                </div>
              )}
              <div style={contactStyles.formGroup}>
                <label style={contactStyles.label}>Your Name</label>
                <input style={contactStyles.input} type="text" required placeholder="Sophie Martin" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div style={contactStyles.formGroup}>
                <label style={contactStyles.label}>Email Address</label>
                <input style={contactStyles.input} type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div style={contactStyles.formGroup}>
                <label style={contactStyles.label}>Message</label>
                <textarea style={{...contactStyles.input, minHeight: '120px', resize: 'vertical'}} required value={form.message} onChange={e => setForm({...form, message: e.target.value})}></textarea>
              </div>
              <button style={contactStyles.btnSubmit} type="submit">Send Enquiry</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

const contactStyles = {
  section: { padding: '96px 0', background: '#F7F4EF' },
  inner: { maxWidth: '1280px', margin: '0 auto', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'start' },
  left: {},
  overline: { fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8C8679', marginBottom: '12px' },
  h2: { fontFamily: "'Cormorant Garamond', serif", fontSize: '44px', fontWeight: 300, color: '#1A1A18', lineHeight: 1.1, letterSpacing: '-0.01em', marginBottom: '20px' },
  body: { fontFamily: "'Jost', sans-serif", fontSize: '14px', color: '#8C8679', lineHeight: 1.7, marginBottom: '32px' },
  details: { display: 'flex', flexDirection: 'column', gap: '12px' },
  detailRow: { display: 'flex', gap: '16px', alignItems: 'baseline', borderBottom: '1px solid #E0DDD7', paddingBottom: '12px' },
  detailLabel: { fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C4BFB8', minWidth: '80px' },
  detailValue: { fontFamily: "'Jost', sans-serif", fontSize: '13px', color: '#1A1A18' },
  right: { background: 'white', padding: '40px', borderRadius: '2px', boxShadow: '0 2px 8px rgba(26,26,24,0.08)' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  workRef: { display: 'flex', gap: '14px', alignItems: 'center', padding: '14px', background: '#F7F4EF', borderRadius: '2px', border: '1px solid #E0DDD7' },
  workRefImg: { width: '48px', height: '48px', borderRadius: '1px', flexShrink: 0 },
  workRefTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '15px', fontStyle: 'italic', color: '#1A1A18' },
  workRefCat: { fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: '#C4BFB8', marginTop: '2px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontFamily: "'Jost', sans-serif", fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#5C5750' },
  input: { fontFamily: "'Jost', sans-serif", fontSize: '14px', color: '#1A1A18', background: 'white', border: '1px solid #E0DDD7', borderRadius: '2px', padding: '11px 14px', outline: 'none' },
  btnSubmit: { fontFamily: "'Jost', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#1A4D2E', color: 'white', border: 'none', padding: '14px', borderRadius: '2px', cursor: 'pointer' },
  success: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '40px 20px', gap: '12px' },
  successMark: { width: '56px', height: '56px', background: '#EEF6E9', borderRadius: '999px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#1A4D2E' },
  successTitle: { fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 400, color: '#1A1A18' },
  successBody: { fontFamily: "'Jost', sans-serif", fontSize: '14px', color: '#8C8679', lineHeight: 1.65, maxWidth: '280px' },
  btnBack: { fontFamily: "'Jost', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'transparent', color: '#1A4D2E', border: '1.5px solid #1A4D2E', padding: '10px 24px', borderRadius: '2px', cursor: 'pointer', marginTop: '8px' },
};

Object.assign(window, { ContactSection });
