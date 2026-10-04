import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LayoutDashboard, PlusCircle, ListFilter, Award, History, LogOut, UserCheck, Layers, AlertTriangle, BarChart3, Bot } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, activeTab, setActiveTab } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-report', label: 'New Report', icon: PlusCircle },
    { id: 'my-reports', label: user?.role === 'officer' ? 'All Violation Reports' : 'My Reports', icon: ListFilter },
    { id: 'map-layers', label: 'GIS Map Layers', icon: Layers },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'activity', label: 'Activity Log', icon: History },
    { id: 'hazards', label: 'Road Hazards', icon: AlertTriangle },
    { id: 'insights', label: 'Safety Insights', icon: BarChart3 },
    { id: 'civic-ai', label: 'CivicDrive AI', icon: Bot }
  ];

  return (
    <nav className="glass-panel" style={{ padding: '14px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
        <div style={{ background: 'linear-gradient(135deg, #176fc3, #4aa3ff)', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 15px rgba(56,189,248,0.3)' }}>
          <ShieldAlert size={24} color="#fff" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', background: 'linear-gradient(90deg, #9bd3ff, #4aa3ff, #f4f8fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CivicDrive
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#9bb0ca', display: 'block', marginTop: '-2px' }}>
            Smarter roads. Safer journeys.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.85rem', color: '#4aa3ff', fontWeight: '600' }}>
          <UserCheck size={16} />
          <span>{user?.name}</span>
          <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: user?.role === 'officer' ? '#2563eb' : '#2563eb', color: '#fff', marginLeft: '4px', textTransform: 'uppercase' }}>
            {user?.role}
          </span>
        </div>

        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`btn ${isActive ? '' : 'btn-secondary'}`}
              style={{
                padding: '8px 14px',
                fontSize: '0.85rem',
                borderRadius: '10px',
                background: isActive ? 'linear-gradient(135deg, #176fc3, #2563eb)' : undefined
              }}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          onClick={logout}
          className="btn btn-rose btn-sm"
          title="Sign Out"
          style={{ padding: '8px 12px' }}
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};
