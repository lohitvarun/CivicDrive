import React, { useEffect, useState } from 'react';
import { AlertTriangle, Camera, MapPin, Send, Clock3, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const KEY = 'civicdrive_hazards';

export const RoadHazards = () => {
  const { user, addToast } = useAuth();
  const [form, setForm] = useState({ type: '', severity: 'Medium', location: '', description: '' });
  const [photo, setPhoto] = useState('');
  const [items, setItems] = useState([]);

  const load = () => {
    const all = JSON.parse(localStorage.getItem(KEY) || '[]');
    setItems(all.filter(x => x.email === user?.email));
  };
  useEffect(load, [user?.email]);

  const submit = e => {
    e.preventDefault();
    if (!form.type || !form.location.trim()) {
      addToast('Select a hazard type and enter a location.', 'error');
      return;
    }
    const all = JSON.parse(localStorage.getItem(KEY) || '[]');
    const item = {
      id: `HZ-${Date.now().toString().slice(-7)}`,
      ...form,
      location: form.location.trim(),
      description: form.description.trim(),
      photo,
      email: user?.email,
      status: 'Submitted',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify([item, ...all]));
    setForm({ type: '', severity: 'Medium', location: '', description: '' });
    setPhoto('');
    load();
    addToast(`${item.id} submitted for civic review.`, 'success');
  };

  const handlePhoto = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      addToast('Photo must be under 3 MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  return <section className="feature-page animate-fade-in">
    <div className="page-heading"><div><span className="eyebrow">COMMUNITY SAFETY</span><h1>Road Hazard Reporting</h1><p>Flag potholes, damaged signals, blocked roads and other hazards before they become bigger problems.</p></div><div className="feature-icon"><AlertTriangle size={28}/></div></div>
    <div className="feature-grid">
      <form className="glass-panel feature-card" onSubmit={submit}>
        <h2>Submit a hazard</h2><p className="muted">Provide enough detail for an officer or civic team to locate the issue.</p>
        <label>Hazard type<select className="form-control" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="">Select hazard</option><option>Pothole / Damaged Road</option><option>Broken Traffic Signal</option><option>Road Blockage</option><option>Waterlogging</option><option>Missing Road Sign</option><option>Streetlight Issue</option><option>Debris / Obstruction</option><option>Other</option></select></label>
        <label>Severity<select className="form-control" value={form.severity} onChange={e=>setForm({...form,severity:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></label>
        <label>Location<div className="input-icon"><MapPin size={17}/><input className="form-control" value={form.location} onChange={e=>setForm({...form,location:e.target.value})} placeholder="Street, area or landmark"/></div></label>
        <label>Photo evidence <span className="muted">(optional)</span><div className="upload-box"><Camera size={20}/><input type="file" accept="image/*" onChange={handlePhoto}/>{photo && <img src={photo} alt="Hazard preview"/>}</div></label>
        <label>Description<textarea className="form-control" rows="4" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="What is happening and how does it affect road users?"/></label>
        <button className="btn" type="submit"><Send size={17}/> Submit Hazard Report</button>
      </form>
      <div className="glass-panel feature-card"><h2>My hazard reports</h2><p className="muted">Track the community issues you have submitted.</p>
        {items.length === 0 ? <div className="empty-state"><AlertTriangle size={30}/><strong>No hazard reports yet</strong><span>Your submitted road-safety issues will appear here.</span></div> : <div className="hazard-list">{items.map(x=><article className="hazard-item" key={x.id}><div><strong>{x.type}</strong><span>{x.id} · {x.severity}</span><small><MapPin size={13}/> {x.location}</small><small><Clock3 size={13}/> {new Date(x.createdAt).toLocaleString()}</small></div><span className="status-chip"><CheckCircle2 size={14}/> {x.status}</span></article>)}</div>}
      </div>
    </div>
  </section>;
};
