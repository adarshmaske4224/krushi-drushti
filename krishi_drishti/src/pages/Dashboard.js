import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pestAPI, priceAPI, weatherAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [pestCount, setPestCount] = useState(0);
  const [price, setPrice] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetMr = new Date().getHours() < 12 ? 'शुभ प्रभात' : new Date().getHours() < 17 ? 'शुभ दुपार' : 'शुभ संध्याकाळ';

  useEffect(() => {
    const load = async () => {
      try {
        const [pestRes] = await Promise.allSettled([
          pestAPI.getHistory(),
          user?.district && user?.state && user?.primaryCrop
            ? priceAPI.getPrice(user.primaryCrop, user.state, user.district, user.district)
            : Promise.resolve(null),
          user?.district
            ? weatherAPI.predict(user.district, user.state, user.primaryCrop)
            : Promise.resolve(null),
        ]);
        if (pestRes.status === 'fulfilled') setPestCount(pestRes.value?.data?.length || 0);
      } catch (e) { }
      finally { setLoading(false); }
    };
    load();
  }, [user]);

  const quickLinks = [
    { to: '/prices', icon: 'fa-indian-rupee-sign', label: 'Check Prices', labelMr: 'भाव तपासा', color: 'gold' },
    { to: '/pest', icon: 'fa-bug', label: 'Detect Pest', labelMr: 'कीड ओळखा', color: 'red' },
    { to: '/weather', icon: 'fa-cloud-sun-rain', label: 'Weather Alert', labelMr: 'हवामान', color: 'sky' },
    { to: '/schemes', icon: 'fa-file-invoice', label: 'View Schemes', labelMr: 'योजना पहा', color: 'green' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green-primary) 60%, var(--green-mid) 100%)',
        borderRadius: 'var(--radius-lg)', padding: '2rem 2.5rem', marginBottom: '2rem',
        position: 'relative', overflow: 'hidden', color: 'white'
      }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', fontSize: '8rem', opacity: 0.07 }}>🌾</div>
        <div style={{ position: 'absolute', right: '120px', bottom: '-30px', fontSize: '6rem', opacity: 0.05 }}>🚜</div>
        <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '4px' }}>{greeting} • {greetMr}</p>
        <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
          {user?.fullName?.split(' ')[0] || 'Farmer'} <span style={{ opacity: 0.6 }}>👋</span>
        </h1>
        <p className="marathi" style={{ opacity: 0.8, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
          आपल्या शेतासाठी आजचे अपडेट्स पहा
        </p>
        <div className="d-flex gap-2 flex-wrap mt-3">
          <span style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            lineHeight: '1.2'
          }}>
            <i className="fas fa-map-marker-alt me-2"></i>{user?.district}, {user?.state}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            lineHeight: '1.2'
          }}>
            <i className="fas fa-seedling me-2"></i>{user?.primaryCrop}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            lineHeight: '1.2'
          }}>
            <i className="fas fa-ruler-combined me-2"></i>{user?.landSizeAcres} Acres
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="km-stats-grid">
        {[
          { label: 'Pest Reports', labelMr: 'कीड अहवाल', value: loading ? '...' : pestCount, icon: 'fa-bug', color: 'red', sub: 'Total this season' },
          { label: 'Land Size', labelMr: 'जमीन क्षेत्र', value: `${user?.landSizeAcres || 0}`, icon: 'fa-ruler-combined', color: 'green', sub: 'Acres' },
          { label: 'Category', labelMr: 'प्रवर्ग', value: user?.category || 'GEN', icon: 'fa-id-card', color: 'gold', sub: 'Farmer category' },
          { label: 'Income', labelMr: 'उत्पन्न', value: `₹${((user?.annualIncome || 0) / 1000).toFixed(0)}K`, icon: 'fa-coins', color: 'sky', sub: 'Annual income' },
        ].map((s, i) => (
          <div className="stagger-enter" key={i}>
            <div className={`km-stat-card ${s.color}`}>
              <div className="stat-label">{s.label} <span className="marathi" style={{ fontSize: '0.7rem' }}>/ {s.labelMr}</span></div>
              <div className={`stat-value mt-1`} style={{ color: `var(--${s.color === 'red' ? 'red-alert' : s.color === 'gold' ? 'gold' : s.color === 'sky' ? 'sky' : 'green-primary'})` }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>{s.sub}</div>
              <i className={`fas ${s.icon} stat-icon`}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="km-card mb-4">
        <div className="km-card-header">
          <div className="km-card-icon green"><i className="fas fa-bolt"></i></div>
          <div>
            <h5 style={{ margin: 0, fontWeight: 700 }}>Quick Actions</h5>
            <small className="marathi" style={{ color: 'var(--text-light)' }}>जलद कृती</small>
          </div>
        </div>
        <div className="km-quick-grid">
          {quickLinks.map((q, i) => (
            <div className="stagger-enter" key={i}>
              <Link to={q.to} style={{ textDecoration: 'none' }}>
                <div className="quick-action-card">
                  <div className={`km-card-icon ${q.color} mx-auto mb-2`} style={{ width: 52, height: 52, fontSize: '1.25rem' }}>
                    <i className={`fas ${q.icon}`}></i>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-dark)' }}>{q.label}</div>
                  <div className="marathi" style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{q.labelMr}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="km-card">
        <div className="km-card-header">
          <div className="km-card-icon gold"><i className="fas fa-lightbulb"></i></div>
          <div>
            <h5 style={{ margin: 0, fontWeight: 700 }}>Farming Tips Today</h5>
            <small className="marathi" style={{ color: 'var(--text-light)' }}>आजच्या शेती टिप्स</small>
          </div>
        </div>
        <div className="row g-3">
          {[
            { icon: '💧', tip: 'Water crops early morning to reduce evaporation loss.', mr: 'पहाटे पाणी द्या — बाष्पीभवन कमी होते.' },
            { icon: '🌿', tip: 'Check leaves for yellowing — early sign of nutrient deficiency.', mr: 'पानांवर पिवळेपणा — पोषण कमतरतेचे लक्षण.' },
            { icon: '🌡️', tip: 'High humidity this week — watch for fungal disease spread.', mr: 'जास्त आर्द्रता — बुरशीजन्य रोगांकडे लक्ष द्या.' },
          ].map((t, i) => (
            <div className="col-md-4" key={i}>
              <div style={{ background: 'var(--green-mist)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{t.icon}</div>
                <p style={{ fontSize: '0.84rem', marginBottom: '0.25rem', fontWeight: 500 }}>{t.tip}</p>
                <p className="marathi" style={{ fontSize: '0.78rem', color: 'var(--text-light)', margin: 0 }}>{t.mr}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;