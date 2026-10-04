import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle2, Award, PlusCircle, Activity, ShieldCheck, PieChart, ArrowRight } from 'lucide-react';

export const Dashboard = () => {
  const { user, token, setActiveTab } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, certs: 0, breakdown: [] });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchActivities();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentActivities(data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Welcome Banner Card */}
      <div className="glass-panel" style={{ padding: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.1, pointerEvents: 'none' }}>
          <ShieldCheck size={240} color="#4aa3ff" />
        </div>

        <h2 style={{ fontSize: '1.5rem', color: '#4aa3ff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          Welcome back, {user?.name}! 👋
        </h2>
        <p style={{ color: '#d7e4f2', fontSize: '0.95rem', maxWidth: '650px', lineHeight: 1.6 }}>
          {user?.role === 'officer'
            ? 'As a Traffic Control Officer, you can review citizen-submitted violation reports, verify evidence, approve or reject cases, and issue official Road Safety Certificates.'
            : 'Thank you for contributing to safer roads! Report traffic violations in your area, track their review status, and receive verified digital volunteer certificates upon report approval.'}
        </p>

        <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('new-report')} className="btn" style={{ padding: '10px 18px' }}>
            <PlusCircle size={18} /> Submit New Report
          </button>
          <button onClick={() => setActiveTab('my-reports')} className="btn btn-secondary" style={{ padding: '10px 18px' }}>
            Track Violations <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(56,189,248,0.15)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(56,189,248,0.3)' }}>
            <FileText size={28} color="#4aa3ff" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{stats.total}</div>
            <div style={{ fontSize: '0.75rem', color: '#9bb0ca', textTransform: 'uppercase', fontWeight: '700' }}>Total Reports</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(245,158,11,0.15)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Clock size={28} color="#8bbcff" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{stats.pending}</div>
            <div style={{ fontSize: '0.75rem', color: '#9bb0ca', textTransform: 'uppercase', fontWeight: '700' }}>Pending / Review</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.3)' }}>
            <CheckCircle2 size={28} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{stats.approved}</div>
            <div style={{ fontSize: '0.75rem', color: '#9bb0ca', textTransform: 'uppercase', fontWeight: '700' }}>Approved Cases</div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: 'rgba(139,92,246,0.15)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Award size={28} color="#77c4ff" />
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>{stats.certs}</div>
            <div style={{ fontSize: '0.75rem', color: '#9bb0ca', textTransform: 'uppercase', fontWeight: '700' }}>Certificates</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Violation Categories & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Violation Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#4aa3ff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} /> Violation Type Distribution
          </h3>

          {stats.breakdown.length === 0 ? (
            <div style={{ color: '#7188a4', textAlign: 'center', padding: '30px 0', fontSize: '0.9rem' }}>
              No violations recorded yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.breakdown.map((item, idx) => {
                const pct = Math.round((item.count / (stats.total || 1)) * 100);
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                      <span style={{ color: '#e4edf7', fontWeight: '500' }}>{item.violation_type}</span>
                      <span style={{ color: '#4aa3ff', fontWeight: '700' }}>{item.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: 'linear-gradient(90deg, #176fc3, #4aa3ff)',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#4aa3ff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} /> Recent Activity Feed
          </h3>

          {recentActivities.length === 0 ? (
            <div style={{ color: '#7188a4', textAlign: 'center', padding: '30px 0', fontSize: '0.9rem' }}>
              No recent activity found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentActivities.map((act, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(0,0,0,0.2)',
                    borderLeft: '3px solid #4aa3ff',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <div style={{ color: '#e4edf7', fontWeight: '500' }}>{act.action}</div>
                  <div style={{ fontSize: '0.75rem', color: '#7188a4', marginTop: '2px' }}>
                    {new Date(act.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
