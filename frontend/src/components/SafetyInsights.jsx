import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, MapPinned, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HKEY = 'civicdrive_hazards';
export const SafetyInsights = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState([]);
  const [hazards, setHazards] = useState([]);
  useEffect(() => {
    setHazards(JSON.parse(localStorage.getItem(HKEY) || '[]'));
    fetch('/api/reports', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.ok ? r.json() : []).then(d => setReports(Array.isArray(d) ? d : (d.reports || []))).catch(() => setReports([]));
  }, [token]);

  const categories = useMemo(() => {
    const m = {};
    reports.forEach(r => { const k = r.violationType || r.type || 'Other'; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6);
  }, [reports]);
  const locations = useMemo(() => {
    const m = {};
    [...reports, ...hazards].forEach(r => { const k = r.location || r.area || 'Unspecified'; m[k] = (m[k] || 0) + 1; });
    return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6);
  }, [reports, hazards]);
  const total = reports.length + hazards.length;
  const approved = reports.filter(r => String(r.status).toLowerCase() === 'approved').length;
  const priority = hazards.filter(h => ['High','Critical'].includes(h.severity)).length;

  return <section className="feature-page animate-fade-in">
    <div className="page-heading"><div><span className="eyebrow">CIVIC INTELLIGENCE</span><h1>Safety Insights</h1><p>Turn community reports into a clear picture of road-safety activity.</p></div><div className="feature-icon"><BarChart3 size={28}/></div></div>
    <div className="insight-kpis"><div className="glass-panel insight-kpi"><span>Total activity</span><strong>{total}</strong><small>Reports + hazards</small></div><div className="glass-panel insight-kpi"><span>Verified reports</span><strong>{approved}</strong><small>Approved cases</small></div><div className="glass-panel insight-kpi"><span>Hazards</span><strong>{hazards.length}</strong><small>Community road issues</small></div><div className="glass-panel insight-kpi danger"><span>Priority hazards</span><strong>{priority}</strong><small>High / critical</small></div></div>
    <div className="feature-grid">
      <div className="glass-panel feature-card"><h2><BarChart3 size={20}/> Violation trends</h2><div className="bars">{categories.length ? categories.map(([name,n]) => <div className="bar-row" key={name}><span>{name}</span><div><i style={{width:`${Math.max(8,(n/categories[0][1])*100)}%`}}/></div><b>{n}</b></div>) : <div className="empty-state"><BarChart3 size={28}/><span>No report data available yet.</span></div>}</div></div>
      <div className="glass-panel feature-card"><h2><MapPinned size={20}/> Community hotspots</h2>{locations.length ? locations.map(([name,n])=><div className="hotspot-row" key={name}><div><strong>{name}</strong><small>Reported activity</small></div><b>{n}</b></div>) : <div className="empty-state"><MapPinned size={28}/><span>Hotspots appear as reports are submitted.</span></div>}</div>
    </div>
    <div className="glass-panel snapshot"><ShieldCheck size={24}/><div><h2>Safety snapshot</h2><p>{total ? `CivicDrive currently has ${total} recorded community safety item${total===1?'':'s'} in the available data.` : 'Start contributing by submitting a traffic violation or road hazard.'} {priority ? `${priority} hazard${priority===1?' is':'s are'} marked high or critical.` : 'No high or critical hazard has been recorded in the available hazard data.'}</p></div><AlertTriangle size={24}/></div>
  </section>;
};
