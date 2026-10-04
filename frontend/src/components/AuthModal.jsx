import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, User, Phone, LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';

export const AuthModal = () => {
  const { login, addToast } = useAuth();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      login(data.user, data.token);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      addToast('All fields are required', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      addToast(data.message, 'success');
      setTab('login');
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: demoEmail, password: demoPass })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          login(data.user, data.token);
        } else {
          addToast(data.error || 'Quick login failed', 'error');
        }
      })
      .catch(err => addToast(err.message, 'error'));
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '36px 30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, #176fc3, #4aa3ff)', padding: '14px', borderRadius: '16px', marginBottom: '12px', boxShadow: '0 8px 25px rgba(56,189,248,0.3)' }}>
            <ShieldAlert size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', background: 'linear-gradient(90deg, #4aa3ff, #4aa3ff, #f4f8fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            CivicDrive
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#9bb0ca', marginTop: '4px' }}>
            Report violations &middot; Track cases &middot; Earn certificates
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setTab('login')}
            className={`btn ${tab === 'login' ? '' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
          >
            <LogIn size={16} /> Login
          </button>
          <button
            onClick={() => setTab('register')}
            className={`btn ${tab === 'register' ? 'btn-amber' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}
          >
            <UserPlus size={16} /> Register
          </button>
        </div>

        {tab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
                <input
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
                <input
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Account Role</label>
              <div style={{ position: 'relative' }}>
                <Shield size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
                <select
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  value={role}
                  onChange={e => setRole(e.target.value)}
                >
                  <option value="citizen">Citizen Volunteer</option>
                  <option value="officer">Traffic Police Officer / Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '13px', color: '#7188a4' }} />
                <input
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: '42px' }}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-amber" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        {/* Demo Preset Helper */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#4aa3ff', marginBottom: '10px', fontWeight: '600' }}>
            <Sparkles size={14} /> Quick Demo Accounts:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => quickLogin('user@example.com', 'user123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 8px' }}
            >
              Citizen Demo
            </button>
            <button
              onClick={() => quickLogin('officer@traffic.gov.in', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', padding: '6px 8px', color: '#77c4ff' }}
            >
              Officer Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
