import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CertificateModal } from './CertificateModal';
import { Award, ShieldCheck, Eye, Calendar, FileText } from 'lucide-react';

export const Certificates = () => {
  const { token } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, [token]);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/certificates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCerts(data);
      }
    } catch (err) {
      console.error('Error fetching certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#4aa3ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={24} /> Reward Certificates
        </h2>
        <p style={{ color: '#9bb0ca', fontSize: '0.85rem', marginTop: '4px' }}>
          Verified Road Safety Volunteer Certificates granted for approved traffic violation reports.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#9bb0ca' }}>Loading certificates...</div>
      ) : certs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#7188a4' }}>
          <Award size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <div style={{ fontSize: '1rem', color: '#e4edf7' }}>No certificates earned yet</div>
          <p style={{ fontSize: '0.85rem', color: '#7188a4', marginTop: '4px' }}>
            Submit violation reports! When an officer approves your report, your certificate will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {certs.map(c => (
            <div
              key={c.id}
              style={{
                background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.6), rgba(4, 120, 87, 0.6))',
                border: '2px dashed rgba(52, 211, 153, 0.4)',
                borderRadius: '16px',
                padding: '24px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '50%', display: 'inline-flex', marginBottom: '10px' }}>
                <ShieldCheck size={36} color="#60a5fa" />
              </div>

              <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>
                Road Safety Volunteer Certificate
              </div>

              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: '#d8e9ff', margin: '8px 0' }}>
                {c.user_name}
              </div>

              <div style={{ fontSize: '0.8rem', color: '#d9edff', lineHeight: 1.5, margin: '8px 0 16px' }}>
                Report <strong>{c.report_code}</strong> ({c.violation_type}, Vehicle {c.vehicle_number})
              </div>

              <div style={{ fontSize: '0.75rem', color: '#c8e3ff', marginBottom: '16px', fontFamily: 'monospace' }}>
                Cert. No: {c.cert_number} &middot; Issued: {new Date(c.issued_at).toLocaleDateString()}
              </div>

              <button
                onClick={() => setSelectedCert(c)}
                className="btn btn-amber btn-sm"
                style={{ width: '100%' }}
              >
                <Eye size={16} /> View & Print Certificate
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
