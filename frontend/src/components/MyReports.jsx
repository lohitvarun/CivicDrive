import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { ListFilter, Search, CheckCircle, XCircle, Eye, Award, Calendar, MapPin, Car, ShieldAlert, Sparkles } from 'lucide-react';

export const MyReports = () => {
  const { user, token, addToast } = useAuth();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [token]);

  useEffect(() => {
    filterData();
  }, [reports, filterStatus, searchTerm]);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let result = [...reports];
    if (filterStatus !== 'ALL') {
      result = result.filter(r => r.status.toUpperCase() === filterStatus);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(r =>
        r.report_code.toLowerCase().includes(term) ||
        r.vehicle_number.toLowerCase().includes(term) ||
        r.violation_type.toLowerCase().includes(term) ||
        r.location.toLowerCase().includes(term)
      );
    }
    setFilteredReports(result);
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');

      if (newStatus === 'approved') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        addToast(`Report approved! Road Safety Certificate issued.`, 'success');
      } else {
        addToast(data.message, 'info');
      }

      fetchReports();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: '#4aa3ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListFilter size={22} /> {user?.role === 'officer' ? 'Traffic Reports Management' : 'My Reported Violations'}
          </h2>
          <p style={{ color: '#9bb0ca', fontSize: '0.85rem', marginTop: '4px' }}>
            Track incident status and evidence submissions
          </p>
        </div>

        {/* Filter Badges & Search */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#7188a4' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '36px', padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
              placeholder="Search vehicle, location..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.25)', padding: '4px', borderRadius: '10px' }}>
            {['ALL', 'PENDING', 'REVIEW', 'APPROVED', 'REJECTED'].map(st => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`btn btn-sm ${filterStatus === st ? '' : 'btn-secondary'}`}
                style={{ padding: '5px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#9bb0ca' }}>Loading reports...</div>
      ) : filteredReports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#7188a4' }}>
          <ShieldAlert size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <div>No violation reports found matching criteria.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredReports.map(r => {
            const badgeClass =
              r.status === 'pending'
                ? 'badge-pending'
                : r.status === 'review'
                ? 'badge-review'
                : r.status === 'approved'
                ? 'badge-approved'
                : 'badge-rejected';

            return (
              <div
                key={r.id}
                style={{
                  background: 'rgba(0,0,0,0.25)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  padding: '20px',
                  borderLeft: `4px solid ${
                    r.status === 'approved'
                      ? '#3b82f6'
                      : r.status === 'rejected'
                      ? '#ef5b6b'
                      : r.status === 'review'
                      ? '#4aa3ff'
                      : '#5b9cff'
                  }`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', fontFamily: 'monospace', color: '#4aa3ff' }}>
                      {r.report_code}
                    </span>
                    <span className={`badge ${badgeClass}`}>{r.status}</span>
                  </div>

                  {user?.role === 'officer' && (
                    <span style={{ fontSize: '0.8rem', color: '#9bb0ca' }}>
                      Submitted by: <strong style={{ color: '#e4edf7' }}>{r.user_name || r.user_email}</strong>
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '0.85rem', marginBottom: '12px' }}>
                  <div>
                    <span style={{ color: '#7188a4' }}>Violation: </span>
                    <strong style={{ color: '#f4f8fd' }}>{r.violation_type}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#7188a4' }}>Vehicle: </span>
                    <strong style={{ color: '#4aa3ff', fontFamily: 'monospace' }}>{r.vehicle_number}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#7188a4' }}>Location: </span>
                    <span style={{ color: '#d7e4f2' }}>{r.location}</span>
                  </div>
                  <div>
                    <span style={{ color: '#7188a4' }}>Incident Date: </span>
                    <span style={{ color: '#d7e4f2' }}>{new Date(r.violation_time).toLocaleString()}</span>
                  </div>
                </div>

                {r.description && (
                  <div style={{ fontSize: '0.85rem', color: '#d7e4f2', fontStyle: 'italic', marginBottom: '12px', background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: '8px' }}>
                    "{r.description}"
                  </div>
                )}

                {/* Evidence Thumbnail & Officer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  {r.photo_url ? (
                    <button
                      onClick={() => setSelectedPhoto(r.photo_url)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem' }}
                    >
                      <Eye size={14} /> View Evidence Photo
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: '#7188a4' }}>No photo attached</span>
                  )}

                  {/* Actions for User or Officer */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {user?.role === 'officer' ? (
                      <>
                        {r.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'review')}
                            className="btn btn-amber btn-sm"
                          >
                            Mark Review
                          </button>
                        )}
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'approved')}
                            className="btn btn-emerald btn-sm"
                          >
                            <CheckCircle size={14} /> Approve & Issue Cert
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(r.id, 'rejected')}
                            className="btn btn-rose btn-sm"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        )}
                      </>
                    ) : (
                      r.status === 'approved' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#60a5fa', fontWeight: 600 }}>
                          <Award size={16} /> Certificate Earned!
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 999999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedPhoto(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedPhoto}
              alt="Violation Evidence"
              style={{ width: '100%', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain' }}
            />
            <div style={{ textAlign: 'center', marginTop: '12px', color: '#fff', fontSize: '0.85rem' }}>
              Click anywhere to close preview
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
