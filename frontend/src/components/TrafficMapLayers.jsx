import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as Icons from 'lucide-react';

// Resolve icon exports safely — some lucide-react versions rename or omit icons.
const Layers = Icons.Layers;
const Flame = Icons.Flame;
const Video = Icons.Video;
const ShieldAlert = Icons.ShieldAlert;
const Navigation = Icons.Navigation;
const RefreshCw = Icons.RefreshCw;
const AlertTriangle = Icons.AlertTriangle;
const Ban = Icons.Ban;
const CloudRain = Icons.CloudRain;
const FileText = Icons.FileText;
const ShieldCheck = Icons.ShieldCheck;
const Circle = Icons.Circle;
const Wifi = Icons.Wifi;
const Car = Icons.Car;
const X = Icons.X;
const CheckCircle2 = Icons.CheckCircle2 || Icons.CheckCircle;
const Clock = Icons.Clock;
// GasPump may not exist in some package versions — fall back to `Car` as a safe default
const GasPump = Icons.GasPump || Icons.GasStation || Icons.Fuel || Icons.Car;

/* ─────── tiny helpers ────────────────────────────────────── */
const Dot = ({ color, pulse }) => (
  <span style={{
    display: 'inline-block', width: 10, height: 10, borderRadius: '50%',
    background: color, boxShadow: `0 0 8px ${color}`,
    animation: pulse ? 'pulse 1.5s infinite' : 'none'
  }} />
);

const SectionHeader = ({ icon: Icon, label, color = '#4aa3ff' }) => (
  <h3 style={{ fontSize: '1.05rem', color, display: 'flex', alignItems: 'center', gap: 8,
    borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10, marginBottom: 14 }}>
    <Icon size={18} /> {label}
  </h3>
);

const severityColor = (s) => ({
  CRITICAL: '#ef5b6b', HIGH: '#5b9cff', WARNING: '#5b9cff',
  MEDIUM: '#5b9cff', LOW: '#3b82f6', INFO: '#4aa3ff',
  MINOR: '#3b82f6', MODERATE: '#5b9cff', SEVERE: '#ef5b6b'
}[s] || '#9bb0ca');

const statusBadge = (st, label) => {
  const colors = {
    ACTIVE: '#3b82f6', OFFLINE: '#ef5b6b', MAINTENANCE: '#5b9cff',
    PAID: '#3b82f6', UNPAID: '#ef5b6b', DISPUTED: '#5b9cff', WAIVED: '#7188a4',
    BANNED: '#ef5b6b', HIGH_RISK: '#5b9cff', WATCH: '#4aa3ff',
    GREEN: '#3b82f6', RED: '#ef5b6b', YELLOW: '#5b9cff',
  };
  const c = colors[st] || '#9bb0ca';
  return (
    <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 10px', borderRadius: 20,
      background: `${c}22`, border: `1px solid ${c}55`, color: c }}>
      {label || st}
    </span>
  );
};

/* ─────── Layer toggle button ─────────────────────────────── */
const LayerBtn = ({ active, onClick, icon: Icon, label, count, color }) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px',
    borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
    background: active ? `${color}22` : 'rgba(255,255,255,0.04)',
    color: active ? color : '#9bb0ca', transition: 'all 0.2s'
  }}>
    <Icon size={14} /> {label} <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({count})</span>
  </button>
);

/* ──────────────────────────────────────────────────────────── */
export const TrafficMapLayers = () => {
  const { token, addToast } = useAuth();
  const [data, setData] = useState({
    layer_hotspots: [], layer_cameras: [], layer_patrols: [],
    layer_traffic_flow: [], layer_alerts: [], layer_blacklist: [],
    layer_road_conditions: [], layer_challans: [],
    layer_petrol_stations: []
  });
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('radar');   // 'radar' | 'challans' | 'alerts' | 'blacklist' | 'roads'
  const [radarLayers, setRadarLayers] = useState({
    hotspots: true, cameras: true, flow: true, patrols: true, petrol: true
  });
  const [selectedNode, setSelectedNode] = useState(null);

  const toggleRadarLayer = (k) => setRadarLayers(p => ({ ...p, [k]: !p[k] }));

  useEffect(() => { fetchAll(); }, [token]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/layers/map-data', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setData(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const markChallanPaid = async (id) => {
    try {
      const res = await fetch(`/api/layers/challans/${id}/pay`, {
        method: 'PATCH', headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) { addToast('Challan marked as PAID ✅', 'success'); fetchAll(); }
    } catch (e) { addToast('Failed to update challan', 'error'); }
  };

  /* ── Radar pin helpers ──────────────────────────── */
  const mapX = (lng) => Math.max(6, Math.min(94, 50 + (lng - 73.8567) * 750));
  const mapY = (lat) => Math.max(6, Math.min(94, 50 - (lat - 18.5204) * 750));

  /* ════════════════════════════════════════════════════════════ */
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div className="glass-panel" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#4aa3ff', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Layers size={22} /> GIS Traffic Intelligence Layers
          </h2>
          <p style={{ color: '#9bb0ca', fontSize: '0.82rem', marginTop: 3 }}>
            9-layer spatial dashboard: Violation Hotspots · AI Cameras · Patrol Precincts · Live Flow · E-Challans · Emergency Alerts · Repeat Offenders · Road Hazards
          </p>
        </div>
        <button onClick={fetchAll} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh All Layers
        </button>
      </div>

      {/* ── View Tab Selector ── */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: 'radar',     icon: Navigation,      label: 'Live Radar Map',        color: '#4aa3ff' },
          { id: 'challans',  icon: FileText,         label: 'E-Challan / Fines',     color: '#5b9cff' },
          { id: 'alerts',    icon: AlertTriangle,    label: 'Emergency Alerts',      color: '#ef5b6b' },
          { id: 'blacklist', icon: Ban,              label: 'Repeat Offenders',      color: '#77c4ff' },
          { id: 'roads',     icon: CloudRain,        label: 'Road Hazard Conditions', color: '#60a5fa' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
              borderRadius: 12, fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: activeView === tab.id
                ? `linear-gradient(135deg, ${tab.color}33, ${tab.color}22)`
                : 'rgba(255,255,255,0.05)',
              color: activeView === tab.id ? tab.color : '#7188a4',
              borderBottom: activeView === tab.id ? `2px solid ${tab.color}` : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#4aa3ff', fontSize: '1rem' }}>
          Loading GIS intelligence layers…
        </div>
      ) : (
        <>
          {/* ══ VIEW: RADAR MAP ══════════════════════════════════ */}
          {activeView === 'radar' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 20 }}>
              {/* Radar canvas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Layer toggle bar */}
                <div className="glass-panel" style={{ padding: '12px 16px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <LayerBtn active={radarLayers.hotspots} onClick={() => toggleRadarLayer('hotspots')}
                    icon={Flame}     label="Hotspots"  count={data.layer_hotspots.length}   color="#ef5b6b" />
                  <LayerBtn active={radarLayers.cameras}  onClick={() => toggleRadarLayer('cameras')}
                    icon={Video}     label="Cameras"   count={data.layer_cameras.length}     color="#4aa3ff" />
                  <LayerBtn active={radarLayers.flow}     onClick={() => toggleRadarLayer('flow')}
                    icon={Navigation} label="Signals"  count={data.layer_traffic_flow.length} color="#5b9cff" />
                  <LayerBtn active={radarLayers.patrols}  onClick={() => toggleRadarLayer('patrols')}
                    icon={ShieldAlert} label="Patrols" count={data.layer_patrols.length}     color="#60a5fa" />
                  <LayerBtn active={radarLayers.petrol}  onClick={() => toggleRadarLayer('petrol')}
                    icon={GasPump} label="Petrol" count={data.layer_petrol_stations ? data.layer_petrol_stations.length : 0}     color="#77c4ff" />
                </div>

                {/* Radar canvas */}
                <div style={{
                  position: 'relative', height: 420,
                  background: 'radial-gradient(circle at center, #081426 0%, #050b16 100%)',
                  border: '2px solid rgba(56,189,248,0.2)', borderRadius: 18, overflow: 'hidden',
                  boxShadow: '0 0 40px rgba(56,189,248,0.06) inset'
                }}>
                  {/* Sweep */}
                  <div style={{ position: 'absolute', inset: 0,
                    background: 'conic-gradient(from 0deg at 50% 50%, rgba(56,189,248,0.12) 0deg, transparent 55deg)',
                    animation: 'spin 8s linear infinite', pointerEvents: 'none', borderRadius: '50%' }} />

                  {/* Grid rings */}
                  {[10,28,45].map(p => (
                    <div key={p} style={{ position: 'absolute', inset: `${p}%`,
                      border: '1px dashed rgba(56,189,248,0.15)', borderRadius: '50%', pointerEvents: 'none' }} />
                  ))}
                  <div style={{ position: 'absolute', left:'50%', top:0, bottom:0,
                    borderLeft:'1px solid rgba(56,189,248,0.07)', pointerEvents:'none' }} />
                  <div style={{ position: 'absolute', top:'50%', left:0, right:0,
                    borderTop:'1px solid rgba(56,189,248,0.07)', pointerEvents:'none' }} />

                  {/* Label */}
                  <div style={{ position:'absolute', top:12, left:14, fontSize:'0.7rem',
                    color:'#4aa3ff', fontFamily:'monospace', background:'rgba(0,0,0,0.6)',
                    padding:'3px 10px', borderRadius:6, display:'flex', alignItems:'center', gap:6 }}>
                    <Wifi size={11} /> LIVE SCAN · 18.52°N 73.85°E
                  </div>

                  {/* LAYER: Hotspots */}
                  {radarLayers.hotspots && data.layer_hotspots.map((h, i) => (
                    <div key={`hs${i}`} onClick={() => setSelectedNode({ type: 'Hotspot', data: h })}
                      style={{ position:'absolute', left:`${mapX(h.longitude)}%`, top:`${mapY(h.latitude)}%`,
                        transform:'translate(-50%,-50%)', cursor:'pointer', zIndex:10 }}>
                      <div style={{ width:14, height:14, borderRadius:'50%',
                        background: h.severity_level === 'CRITICAL' ? '#ef5b6b' : '#5b9cff',
                        boxShadow:`0 0 14px ${h.severity_level==='CRITICAL'?'#ef5b6b':'#5b9cff'}`,
                        border:'2px solid rgba(255,255,255,0.6)', animation:'pulse 1.8s infinite' }} />
                    </div>
                  ))}

                  {/* LAYER: Cameras */}
                  {radarLayers.cameras && data.layer_cameras.map((c, i) => (
                    <div key={`cam${i}`} onClick={() => setSelectedNode({ type: 'AI Camera', data: c })}
                      style={{ position:'absolute', left:`${mapX(c.longitude)}%`, top:`${mapY(c.latitude)}%`,
                        transform:'translate(-50%,-50%)', cursor:'pointer', zIndex:12 }}>
                      <div style={{ background:'#176fc3', padding:6, borderRadius:'50%',
                        border:'2px solid #4aa3ff', boxShadow:'0 0 10px #4aa3ff' }}>
                        <Video size={11} color="#fff" />
                      </div>
                    </div>
                  ))}

                  {/* LAYER: Patrols */}
                  {radarLayers.patrols && data.layer_patrols.map((p, i) => (
                    <div key={`pat${i}`} onClick={() => setSelectedNode({ type: 'Police Patrol', data: p })}
                      style={{ position:'absolute', left:`${mapX(p.longitude)}%`, top:`${mapY(p.latitude)}%`,
                        transform:'translate(-50%,-50%)', cursor:'pointer', zIndex:14 }}>
                      <div style={{ background:'#2563eb', padding:6, borderRadius:7,
                        border:'2px solid #60a5fa', boxShadow:'0 0 10px #60a5fa' }}>
                        <ShieldCheck size={13} color="#fff" />
                      </div>
                    </div>
                  ))}

                  {/* LAYER: Traffic Flow */}
                  {radarLayers.flow && data.layer_traffic_flow.map((f, i) => {
                    const c = f.status==='GREEN'?'#3b82f6':f.status==='RED'?'#ef5b6b':'#5b9cff';
                    return (
                      <div key={`tf${i}`} onClick={() => setSelectedNode({ type: 'Traffic Signal', data: f })}
                        style={{ position:'absolute', left:`${mapX(f.lng)}%`, top:`${mapY(f.lat)}%`,
                          transform:'translate(-50%,-50%)', cursor:'pointer', zIndex:11 }}>
                        <div style={{ background:c, padding:'4px 7px', borderRadius:5,
                          border:'1px solid rgba(255,255,255,0.5)', fontSize:'0.6rem', fontWeight:800, color:'#fff' }}>
                          {f.status}
                        </div>
                      </div>
                    );
                  })}

                  {/* Road Condition markers */}
                  {data.layer_road_conditions.map((r, i) => (
                    <div key={`rc${i}`} onClick={() => setSelectedNode({ type: 'Road Hazard', data: r })}
                      style={{ position:'absolute', left:`${mapX(r.longitude)}%`, top:`${mapY(r.latitude)}%`,
                        transform:'translate(-50%,-50%)', cursor:'pointer', zIndex:9 }}>
                      <div style={{ background:'#253e69', padding:5, borderRadius:'50%',
                        border:'2px solid #8bbcff', boxShadow:'0 0 8px #8bbcff' }}>
                        <CloudRain size={11} color="#8bbcff" />
                      </div>
                    </div>
                  ))}

                  {/* Petrol station markers */}
                  {radarLayers.petrol && data.layer_petrol_stations && data.layer_petrol_stations.map((p, i) => (
                    <div key={`ps${i}`} onClick={() => setSelectedNode({ type: 'Petrol Station', data: p })}
                      style={{ position:'absolute', left:`${mapX(p.longitude)}%`, top:`${mapY(p.latitude)}%`,
                        transform:'translate(-50%,-50%)', cursor:'pointer', zIndex:12 }}>
                      <div style={{ background:'#77c4ff', padding:6, borderRadius:'50%',
                        border:'2px solid #9bd3ff', boxShadow:'0 0 10px #9bd3ff' }}>
                        <GasPump size={11} color="#fff" />
                      </div>
                    </div>
                  ))}

                  {/* Active alert markers */}
                  {data.layer_alerts.filter(a => a.is_active).map((a, i) => (
                    <div key={`al${i}`} onClick={() => setSelectedNode({ type: 'Emergency Alert', data: a })}
                      style={{ position:'absolute', left:`${mapX(a.longitude)}%`, top:`${mapY(a.latitude)}%`,
                        transform:'translate(-50%,-50%)', cursor:'pointer', zIndex:15 }}>
                      <div style={{ background:'#4a1c2a', padding:5, borderRadius:'50%',
                        border:'2px solid #ef5b6b', boxShadow:'0 0 14px #ef5b6b', animation:'pulse 1s infinite' }}>
                        <AlertTriangle size={12} color="#ef5b6b" />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini legend */}
                <div className="glass-panel" style={{ padding:'10px 16px', display:'flex', gap:14, flexWrap:'wrap', fontSize:'0.72rem', color:'#9bb0ca' }}>
                  <span><Dot color="#ef5b6b" pulse /> Violation</span>
                  <span><Dot color="#4aa3ff" /> AI Camera</span>
                  <span><Dot color="#60a5fa" /> Patrol</span>
                  <span><Dot color="#5b9cff" /> Signal</span>
                  <span><Dot color="#8bbcff" /> Road Hazard</span>
                  <span><Dot color="#ef5b6b" pulse /> Active Alert</span>
                </div>
              </div>

              {/* Inspector panel */}
              <div className="glass-panel" style={{ padding:22, minHeight:300 }}>
                <SectionHeader icon={Layers} label="Layer Node Inspector" />
                {!selectedNode ? (
                  <div style={{ color:'#7188a4', textAlign:'center', padding:'50px 0 30px', fontSize:'0.85rem' }}>
                    Click any icon on the radar canvas to inspect details here.
                  </div>
                ) : (
                  <div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                      <span className="badge badge-review">{selectedNode.type}</span>
                      <button onClick={() => setSelectedNode(null)}
                        style={{ background:'none', border:'none', color:'#7188a4', cursor:'pointer' }}>
                        <X size={16} />
                      </button>
                    </div>

                    <div style={{ display:'flex', flexDirection:'column', gap:10, fontSize:'0.88rem', color:'#e4edf7' }}>
                      {selectedNode.type === 'Hotspot' && <>
                        <div><b style={{ color:'#9bb0ca' }}>Report ID:</b> {selectedNode.data.report_code}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Violation:</b> {selectedNode.data.violation_type}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Vehicle:</b> <span style={{ fontFamily:'monospace', color:'#4aa3ff' }}>{selectedNode.data.vehicle_number}</span></div>
                        <div><b style={{ color:'#9bb0ca' }}>Severity:</b> <span style={{ color: severityColor(selectedNode.data.severity_level), fontWeight:700 }}>{selectedNode.data.severity_level}</span></div>
                        <div><b style={{ color:'#9bb0ca' }}>Location:</b> {selectedNode.data.location}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Fine:</b> ₹{selectedNode.data.fine_amount || 1000}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Status:</b> {statusBadge(selectedNode.data.status)}</div>
                      </>}

                      {selectedNode.type === 'AI Camera' && <>
                        <div><b style={{ color:'#9bb0ca' }}>Camera ID:</b> {selectedNode.data.camera_code}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Location:</b> {selectedNode.data.location_name}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Type:</b> {selectedNode.data.type}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Speed Limit:</b> {selectedNode.data.speed_limit} km/h</div>
                        <div><b style={{ color:'#9bb0ca' }}>Status:</b> {statusBadge(selectedNode.data.status)}</div>
                      </>}

                      {selectedNode.type === 'Police Patrol' && <>
                        <div><b style={{ color:'#9bb0ca' }}>Zone:</b> {selectedNode.data.zone_name}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Precinct:</b> {selectedNode.data.precinct_code}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Active Units:</b> {selectedNode.data.active_units}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Risk Level:</b> <span style={{ color: severityColor(selectedNode.data.risk_level) }}>{selectedNode.data.risk_level}</span></div>
                        <div><b style={{ color:'#9bb0ca' }}>Helpline:</b> {selectedNode.data.contact_phone}</div>
                      </>}

                      {selectedNode.type === 'Traffic Signal' && <>
                        <div><b style={{ color:'#9bb0ca' }}>Junction:</b> {selectedNode.data.location}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Signal Status:</b> {statusBadge(selectedNode.data.status)}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Traffic Flow:</b> {selectedNode.data.flow_rate}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Avg Speed:</b> {selectedNode.data.speed_avg}</div>
                      </>}

                      {selectedNode.type === 'Road Hazard' && <>
                        <div><b style={{ color:'#9bb0ca' }}>Location:</b> {selectedNode.data.location}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Hazard Type:</b> {selectedNode.data.condition_type}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Severity:</b> <span style={{ color: severityColor(selectedNode.data.severity) }}>{selectedNode.data.severity}</span></div>
                        <div><b style={{ color:'#9bb0ca' }}>Resolved:</b> {selectedNode.data.is_resolved ? '✅ Yes' : '⚠️ No'}</div>
                      </>}

                      {selectedNode.type === 'Emergency Alert' && <>
                        <div><b style={{ color:'#9bb0ca' }}>Alert Code:</b> {selectedNode.data.alert_code}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Type:</b> {selectedNode.data.alert_type}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Location:</b> {selectedNode.data.location}</div>
                        <div><b style={{ color:'#9bb0ca' }}>Severity:</b> <span style={{ color: severityColor(selectedNode.data.severity) }}>{selectedNode.data.severity}</span></div>
                        <div><b style={{ color:'#9bb0ca' }}>Description:</b> {selectedNode.data.description}</div>
                      </>}
                    {selectedNode.type === 'Petrol Station' && <>
                      <div><b style={{ color:'#9bb0ca' }}>Station:</b> {selectedNode.data.station_name}</div>
                      <div><b style={{ color:'#9bb0ca' }}>Brand:</b> {selectedNode.data.brand}</div>
                      <div><b style={{ color:'#9bb0ca' }}>Fuel:</b> {selectedNode.data.fuel_type}</div>
                      <div><b style={{ color:'#9bb0ca' }}>Price/Liter:</b> ₹{selectedNode.data.price_per_liter}</div>
                      <div><b style={{ color:'#9bb0ca' }}>Hours:</b> {selectedNode.data.operating_hours}</div>
                    </>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ VIEW: E-CHALLANS / FINE MANAGEMENT ═══════════════ */}
          {activeView === 'challans' && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <SectionHeader icon={FileText} label="E-Challan / Fine Management Layer" color="#5b9cff" />
              {data.layer_challans.length === 0 ? (
                <div style={{ color:'#7188a4', textAlign:'center', padding:'40px 0' }}>No challans issued yet.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {data.layer_challans.map((c, i) => (
                    <div key={i} style={{
                      background:'rgba(0,0,0,0.25)', borderRadius:12, padding:'16px 20px',
                      border:'1px solid rgba(255,255,255,0.06)',
                      borderLeft:`4px solid ${c.payment_status==='PAID'?'#3b82f6':'#ef5b6b'}`
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <span style={{ fontFamily:'monospace', fontWeight:800, color:'#5b9cff' }}>{c.challan_number}</span>
                          {statusBadge(c.payment_status)}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <span style={{ color:'#ef5b6b', fontWeight:800, fontSize:'1.1rem' }}>₹{c.fine_amount}</span>
                          {c.payment_status === 'UNPAID' && (
                            <button onClick={() => markChallanPaid(c.id)} className="btn btn-emerald btn-sm">
                              <CheckCircle2 size={13} /> Mark Paid
                            </button>
                          )}
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'6px 16px', marginTop:10, fontSize:'0.82rem', color:'#d7e4f2' }}>
                        <div><span style={{ color:'#7188a4' }}>Vehicle: </span><span style={{ fontFamily:'monospace', color:'#4aa3ff' }}>{c.vehicle_number}</span></div>
                        <div><span style={{ color:'#7188a4' }}>Violation: </span>{c.violation_type}</div>
                        <div><span style={{ color:'#7188a4' }}>Due Date: </span>{c.due_date ? new Date(c.due_date).toLocaleDateString() : 'N/A'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ VIEW: EMERGENCY ALERTS ═══════════════════════════ */}
          {activeView === 'alerts' && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <SectionHeader icon={AlertTriangle} label="Emergency Incident Alert Layer" color="#ef5b6b" />
              {data.layer_alerts.length === 0 ? (
                <div style={{ color:'#7188a4', textAlign:'center', padding:'40px 0' }}>No emergency alerts on record.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {data.layer_alerts.map((a, i) => (
                    <div key={i} style={{
                      background:'rgba(0,0,0,0.25)', borderRadius:12, padding:'16px 20px',
                      border:'1px solid rgba(255,255,255,0.06)',
                      borderLeft:`4px solid ${a.is_active ? '#ef5b6b' : '#7188a4'}`,
                      opacity: a.is_active ? 1 : 0.6
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10, marginBottom:8 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          {a.is_active && <Dot color="#ef5b6b" pulse />}
                          <span style={{ fontFamily:'monospace', fontWeight:800, color: a.is_active ? '#ef5b6b' : '#7188a4' }}>{a.alert_code}</span>
                          <span className="badge" style={{ background:`${severityColor(a.severity)}22`, color:severityColor(a.severity), border:`1px solid ${severityColor(a.severity)}55`, fontSize:'0.7rem', fontWeight:700, padding:'2px 10px', borderRadius:20 }}>{a.severity}</span>
                        </div>
                        <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:20, background: a.is_active ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)', color: a.is_active ? '#ff7b8a' : '#9bb0ca', fontWeight:700 }}>
                          {a.is_active ? '🔴 ACTIVE' : '✅ RESOLVED'}
                        </span>
                      </div>
                      <div style={{ fontSize:'0.88rem', color:'#e4edf7', fontWeight:600 }}>{a.alert_type.replace(/_/g,' ')}</div>
                      <div style={{ fontSize:'0.82rem', color:'#9bb0ca', marginTop:4 }}>{a.description}</div>
                      <div style={{ fontSize:'0.78rem', color:'#7188a4', marginTop:6 }}>📍 {a.location} &nbsp;·&nbsp; {new Date(a.created_at).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ VIEW: REPEAT OFFENDERS BLACKLIST ══════════════════ */}
          {activeView === 'blacklist' && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <SectionHeader icon={Ban} label="Repeat Offender / Vehicle Blacklist Layer" color="#77c4ff" />
              {data.layer_blacklist.length === 0 ? (
                <div style={{ color:'#7188a4', textAlign:'center', padding:'40px 0' }}>No blacklisted vehicles.</div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  {data.layer_blacklist.map((b, i) => (
                    <div key={i} style={{
                      background: b.risk_tag === 'BANNED' ? 'rgba(239,68,68,0.07)' : 'rgba(0,0,0,0.25)',
                      borderRadius:12, padding:'16px 20px',
                      border:'1px solid rgba(255,255,255,0.06)',
                      borderLeft:`4px solid ${b.risk_tag==='BANNED'?'#ef5b6b':b.risk_tag==='HIGH_RISK'?'#5b9cff':'#4aa3ff'}`
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                          <span style={{ fontFamily:'monospace', fontWeight:800, fontSize:'1.1rem', color:'#fff' }}>{b.vehicle_number}</span>
                          {statusBadge(b.risk_tag)}
                        </div>
                        <div style={{ display:'flex', gap:16, fontSize:'0.85rem' }}>
                          <span><Flame size={14} style={{ display:'inline', marginRight:4 }} /><span style={{ color:'#ef5b6b', fontWeight:800 }}>{b.total_violations}</span> violations</span>
                          <span style={{ color:'#5b9cff', fontWeight:700 }}>₹{b.unpaid_fines} unpaid</span>
                        </div>
                      </div>
                      <div style={{ fontSize:'0.82rem', color:'#9bb0ca', marginTop:8 }}>
                        <span style={{ color:'#7188a4' }}>Owner: </span>{b.owner_name || 'Unknown'} &nbsp;·&nbsp;
                        <span style={{ color:'#7188a4' }}>Reason: </span>{b.blacklist_reason}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ VIEW: ROAD HAZARD CONDITIONS ══════════════════════ */}
          {activeView === 'roads' && (
            <div className="glass-panel" style={{ padding: 28 }}>
              <SectionHeader icon={CloudRain} label="Road Hazard & Condition Layer" color="#60a5fa" />
              {data.layer_road_conditions.length === 0 ? (
                <div style={{ color:'#7188a4', textAlign:'center', padding:'40px 0' }}>No road hazards reported.</div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))', gap:14 }}>
                  {data.layer_road_conditions.map((r, i) => (
                    <div key={i} style={{
                      background:'rgba(0,0,0,0.25)', borderRadius:12, padding:'16px 18px',
                      border:'1px solid rgba(255,255,255,0.06)',
                      borderTop:`3px solid ${severityColor(r.severity)}`
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                        <span style={{ fontSize:'0.9rem', fontWeight:700, color:'#e4edf7' }}>{r.condition_type.replace(/_/g,' ')}</span>
                        <span style={{ fontSize:'0.7rem', fontWeight:700, padding:'2px 9px', borderRadius:20,
                          background:`${severityColor(r.severity)}22`, color:severityColor(r.severity),
                          border:`1px solid ${severityColor(r.severity)}55` }}>{r.severity}</span>
                      </div>
                      <div style={{ fontSize:'0.82rem', color:'#9bb0ca' }}>📍 {r.location}</div>
                      <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem',
                        color: r.is_resolved ? '#60a5fa' : '#5b9cff', fontWeight:600 }}>
                        {r.is_resolved ? <><CheckCircle2 size={13} /> Resolved</> : <><Clock size={13} /> Active / Unresolved</>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* CSS for pulse & spin */}
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); opacity:1; } 50% { transform: scale(1.35); opacity:.75; } }
      `}</style>
    </div>
  );
};
