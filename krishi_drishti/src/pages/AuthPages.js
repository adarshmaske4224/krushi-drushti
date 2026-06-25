import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally { setLoading(false); }
  };

  const particles = ['🌾', '🍃', '🌿', '🚜', '🌱', '🌻', '🍂', '🌾', '🌿', '🍃', '🌱', '🌻'];

  return (
    <div className="km-auth-page">
      {particles.map((p, i) => <span key={i} className="particle">{p}</span>)}
      <div className="km-auth-card">
        <div className="km-auth-logo">
          <div className="logo-circle">🌾</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.6rem' }}>KrishiDrishti</h2>
          <p className="marathi" style={{ color: 'var(--text-light)', fontSize: '1rem' }}>कृषी दृष्टी प्रणाली</p>
        </div>

        {error && <div className="km-alert error"><i className="fas fa-exclamation-circle"></i>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="km-label"><i className="fas fa-envelope me-2"></i>Email Address / ईमेल</label>
            <input className="km-input py-2 px-3" type="email" placeholder="your@email.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="mb-5" style={{ marginBottom: '2rem' }}>
            <label className="km-label"><i className="fas fa-lock me-2"></i>Password / पासवर्ड</label>
            <input className="km-input py-2 px-3" type="password" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn-km-primary w-100 justify-content-center py-2" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Logging in...</>
              : <><i className="fas fa-sign-in-alt me-2"></i>Login / प्रवेश करा</>}
          </button>
        </form>

        <p className="text-center mt-3" style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
          New farmer? <Link to="/register" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>Register here / नोंदणी करा</Link>
        </p>
      </div>
    </div>
  );
};

const STATES = ['Maharashtra', 'Rajasthan', 'Punjab', 'Karnataka', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'Haryana', 'Andhra Pradesh', 'Bihar'];
const CROPS = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Cotton', 'Soybean', 'Sugarcane', 'Potato', 'Maize', 'Other'];
const CATS = ['GEN', 'OBC', 'SC', 'ST'];
const LANGS = [{ val: 'en', label: 'English' }, { val: 'mr', label: 'Marathi (मराठी)' }];

export const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '',
    state: 'Maharashtra', district: '', village: '',
    primaryCrop: 'Wheat', landSizeAcres: '', annualIncome: '',
    category: 'GEN', preferredLanguage: 'en'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await authAPI.register({
        ...form,
        landSizeAcres: parseFloat(form.landSizeAcres),
        annualIncome: parseFloat(form.annualIncome)
      });
      login(res.data.token, res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
      setStep(1);
    } finally { setLoading(false); }
  };

  const particles = ['🌾', '🍃', '🌿', '🚜', '🌱', '🌻', '🍂', '🌾', '🌿', '🍃', '🌱', '🌻'];

  return (
    <div className="km-auth-page" style={{ alignItems: 'flex-start', paddingTop: '2rem' }}>
      {particles.map((p, i) => <span key={i} className="particle">{p}</span>)}
      <div className="km-auth-card" style={{ maxWidth: 560 }}>
        <div className="km-auth-logo">
          <div className="logo-circle">🌾</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem' }}>Join KrishiDrishti</h2>
          <p className="marathi" style={{ color: 'var(--text-light)' }}>कृषी दृष्टी नोंदणी</p>
        </div>

        {/* Progress */}
        <div className="d-flex gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 4, borderRadius: 4,
              background: s <= step ? 'var(--green-primary)' : 'var(--border)',
              transition: 'var(--transition)'
            }}></div>
          ))}
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginBottom: '1.25rem' }}>
          Step {step} of 3 — {step === 1 ? 'Personal Info' : step === 2 ? 'Farm Details' : 'Preferences'}
        </p>

        {error && <div className="km-alert error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="fade-in">
              <div className="row g-3">
                <div className="col-12 mb-2">
                  <label className="km-label">Full Name / पूर्ण नाव</label>
                  <input className="km-input" placeholder="Virat Kohli" value={form.fullName}
                    onChange={e => set('fullName', e.target.value)} required />
                </div>
                <div className="col-12 mb-2">
                  <label className="km-label">Email</label>
                  <input className="km-input" type="email" placeholder="virat@gmail.com" value={form.email}
                    onChange={e => set('email', e.target.value)} required />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="km-label">Password</label>
                  <input className="km-input" type="password" placeholder="Min 6 chars" value={form.password}
                    onChange={e => set('password', e.target.value)} required minLength={6} />
                </div>
                <div className="col-md-6 mb-4">
                  <label className="km-label">Phone / फोन</label>
                  <input className="km-input" placeholder="+919876543210" value={form.phone}
                    onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="pt-3 mt-4">
                <button type="button" className="btn-km-primary w-100 justify-content-center py-2"
                  onClick={() => { if (!form.fullName || !form.email || !form.password) { setError('Fill all fields'); return; } setError(''); setStep(2); }}>
                  Next <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <div className="row g-3">
                <div className="col-md-6 mb-2">
                  <label className="km-label">State / राज्य</label>
                  <select className="km-input" value={form.state} onChange={e => set('state', e.target.value)}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-6 mb-2">
                  <label className="km-label">District / जिल्हा</label>
                  <input className="km-input" placeholder="e.g. Nashik" value={form.district}
                    onChange={e => set('district', e.target.value)} required />
                </div>
                <div className="col-12 mb-2">
                  <label className="km-label">Village / गाव</label>
                  <input className="km-input" placeholder="Village name" value={form.village}
                    onChange={e => set('village', e.target.value)} />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="km-label">Primary Crop / मुख्य पीक</label>
                  <select className="km-input" value={form.primaryCrop} onChange={e => set('primaryCrop', e.target.value)}>
                    {CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-md-6 mb-4">
                  <label className="km-label">Land Size (Acres) / जमीन</label>
                  <input className="km-input" type="number" placeholder="e.g. 5" value={form.landSizeAcres}
                    onChange={e => set('landSizeAcres', e.target.value)} required min="0" step="0.1" />
                </div>
              </div>
              <div className="d-flex gap-3 pt-3 mt-4" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-km-secondary py-2 px-4" onClick={() => setStep(1)}>
                  <i className="fas fa-arrow-left me-2"></i> Back
                </button>
                <button type="button" className="btn-km-primary flex-fill justify-content-center py-2"
                  onClick={() => { if (!form.district || !form.landSizeAcres) { setError('Fill all fields'); return; } setError(''); setStep(3); }}>
                  Next <i className="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <div className="row g-3">
                <div className="col-md-6 mb-2">
                  <label className="km-label">Annual Income (₹) / वार्षिक उत्पन्न</label>
                  <input className="km-input" type="number" placeholder="e.g. 120000" value={form.annualIncome}
                    onChange={e => set('annualIncome', e.target.value)} required min="0" />
                </div>
                <div className="col-md-6 mb-2">
                  <label className="km-label">Category / प्रवर्ग</label>
                  <select className="km-input" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-12 mb-4">
                  <label className="km-label">Preferred Language / भाषा</label>
                  <div className="d-flex gap-3 mt-1">
                    {LANGS.map(l => (
                      <label key={l.val} style={{
                        display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                        padding: '0.6rem 1rem', border: `2px solid ${form.preferredLanguage === l.val ? 'var(--green-primary)' : 'var(--border)'}`,
                        borderRadius: 'var(--radius-sm)', flex: 1, justifyContent: 'center',
                        background: form.preferredLanguage === l.val ? 'var(--green-pale)' : 'white', transition: 'var(--transition)'
                      }}>
                        <input type="radio" name="lang" value={l.val} checked={form.preferredLanguage === l.val}
                          onChange={() => set('preferredLanguage', l.val)} style={{ accentColor: 'var(--green-primary)' }} />
                        {l.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="d-flex gap-3 pt-3 mt-4" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn-km-secondary py-2 px-4" onClick={() => setStep(2)}>
                  <i className="fas fa-arrow-left me-2"></i> Back
                </button>
                <button type="submit" className="btn-km-primary flex-fill justify-content-center py-2" disabled={loading}>
                  {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Registering...</>
                    : <><i className="fas fa-check me-2"></i>Register / नोंदणी करा</>}
                </button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center mt-3" style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};