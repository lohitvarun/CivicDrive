import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { History, Clock, Shield } from 'lucide-react';

export const ActivityLog = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [token]);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    } catch (err) {
      console.error('Error fetching activity log:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ padding: '28px' }}>
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#4aa3ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={24} /> System Activity Log
        </h2>
        <p style={{ color: '#9bb0ca', fontSize: '0.85rem', marginTop: '4px' }}>
          Audit trail of authentication events, report submissions, and officer status updates.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#9bb0ca' }}>Loading activity logs...</div>
      ) : activities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#7188a4' }}>
          <Clock size={48} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
          <div>No activity recorded yet.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {activities.map((act, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.25)',
                borderLeft: '4px solid #4aa3ff',
                borderRadius: '10px',
                padding: '14px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ color: '#f4f8fd', fontSize: '0.9rem', fontWeight: '500' }}>
                  {act.action}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#7188a4', marginTop: '2px' }}>
                  Account: {act.email}
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4aa3ff', fontFamily: 'monospace' }}>
                {new Date(act.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
