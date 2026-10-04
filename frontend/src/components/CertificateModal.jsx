import React from 'react';
import { Award, ShieldCheck, Printer, X, CheckCircle2 } from 'lucide-react';

export const CertificateModal = ({ cert, onClose }) => {
  if (!cert) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
    >
      <div
        className="animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '750px',
          background: 'linear-gradient(135deg, #0b1f44, #1d4ed8, #123d7a)',
          border: '4px double #60a5fa',
          borderRadius: '20px',
          padding: '40px 36px',
          position: 'relative',
          color: '#fff',
          boxShadow: '0 25px 70px rgba(0,0,0,0.7)',
          textAlign: 'center'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '20px',
            top: '20px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {/* Printable Certificate Content */}
        <div id="printableCertificate">
          <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.15)', padding: '16px', borderRadius: '50%', marginBottom: '14px', border: '2px solid rgba(255,255,255,0.3)' }}>
            <Award size={48} color="#d8e9ff" />
          </div>

          <div style={{ fontSize: '0.85rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#c8e3ff', fontWeight: '700' }}>
            Official Commendation
          </div>

          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '8px 0 16px', color: '#f4f8fd', fontFamily: "'Outfit', serif" }}>
            Road Safety Volunteer Certificate
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#d9edff' }}>This is proudly presented to</p>

          <h2 style={{ fontSize: '2rem', color: '#d8e9ff', margin: '12px 0', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            {cert.user_name}
          </h2>

          <p style={{ fontSize: '0.95rem', color: '#eff8ff', maxWidth: '580px', margin: '0 auto 20px', lineHeight: '1.7' }}>
            For valuable citizenship & active contribution to community safety by reporting verified traffic violation (<strong>Report {cert.report_code}</strong> — <em>{cert.violation_type}</em>, Vehicle <strong>{cert.vehicle_number}</strong>) at {cert.location}.
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', margin: '30px 0 20px', paddingTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.2)' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#c8e3ff', textTransform: 'uppercase' }}>Certificate Serial</div>
              <div style={{ fontSize: '1rem', fontWeight: '800', fontFamily: 'monospace', color: '#d8e9ff' }}>{cert.cert_number}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#eff8ff' }}>
              <ShieldCheck size={18} color="#60a5fa" /> Official Traffic Control Authority
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#c8e3ff', textTransform: 'uppercase' }}>Issue Date</div>
              <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{new Date(cert.issued_at).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        <button onClick={handlePrint} className="btn btn-amber" style={{ margin: '10px auto 0' }}>
          <Printer size={18} /> Print Certificate
        </button>
      </div>
    </div>
  );
};
