import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pestAPI, priceAPI, weatherAPI } from '../services/api';

/* ── localization ── */
const LOCALES = {
  en: {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    welcomeSub: 'View today\'s updates for your farm',
    acres: 'Acres',
    pestReports: 'Pest Reports',
    landSize: 'Land Size',
    category: 'Category',
    income: 'Income',
    totalSeason: 'Total this season',
    farmerCategory: 'Farmer category',
    annualIncome: 'Annual income',
    quickActions: 'Quick Actions',
    quickActionsSub: 'Fast and easy',
    farmingTips: 'Farming Tips Today',
    farmingTipsSub: 'Smart advice for today',
    checkPrices: 'Check Prices',
    detectPest: 'Detect Pest',
    weatherAlert: 'Weather Alert',
    viewSchemes: 'View Schemes',
    tip1: 'Water crops early morning to reduce evaporation loss.',
    tip2: 'Check leaves for yellowing — early sign of nutrient deficiency.',
    tip3: 'High humidity this week — watch for fungal disease spread.',
  },
  mr: {
    morning: 'शुभ प्रभात',
    afternoon: 'शुभ दुपार',
    evening: 'शुभ संध्याकाळ',
    welcomeSub: 'आपल्या शेतासाठी आजचे अपडेट्स पहा',
    acres: 'एकर',
    pestReports: 'कीड अहवाल',
    landSize: 'जमीन क्षेत्र',
    category: 'प्रवर्ग',
    income: 'उत्पन्न',
    totalSeason: 'या हंगामातील एकूण',
    farmerCategory: 'शेतकरी प्रवर्ग',
    annualIncome: 'वार्षिक उत्पन्न',
    quickActions: 'जलद कृती',
    quickActionsSub: 'सोप्या आणि जलद सुविधा',
    farmingTips: 'आजच्या शेती टिप्स',
    farmingTipsSub: 'आजचा स्मार्ट सल्ला',
    checkPrices: 'भाव तपासा',
    detectPest: 'कीड ओळखा',
    weatherAlert: 'हवामान',
    viewSchemes: 'योजना पहा',
    tip1: 'पहाटे पाणी द्या — बाष्पीभवन कमी होते.',
    tip2: 'पानांवर पिवळेपणा — पोषण कमतरतेचे लक्षण.',
    tip3: 'जास्त आर्द्रता — बुरशीजन्य रोगांकडे लक्ष द्या.',
  }
};

const t = (key, lang = 'en') => {
  const dictionary = LOCALES[lang] || LOCALES.en;
  return dictionary[key] || key;
};

const Dashboard = () => {
  const { user } = useAuth();
  const lang = user?.preferredLanguage || 'en';
  const [pestCount, setPestCount] = useState(0);
  const [price, setPrice] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const hours = new Date().getHours();
  const greetingKey = hours < 12 ? 'morning' : hours < 17 ? 'afternoon' : 'evening';
  const greeting = t(greetingKey, lang);

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
    { to: '/prices', icon: 'fa-indian-rupee-sign', label: t('checkPrices', lang), color: 'gold' },
    { to: '/pest', icon: 'fa-bug', label: t('detectPest', lang), color: 'red' },
    { to: '/weather', icon: 'fa-cloud-sun-rain', label: t('weatherAlert', lang), color: 'sky' },
    { to: '/schemes', icon: 'fa-file-invoice', label: t('viewSchemes', lang), color: 'green' },
  ];

  return (
    <div className="fade-in">
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green-primary) 50%, var(--gold) 130%)',
        borderRadius: 'var(--radius-lg)', padding: '2.5rem 3rem', marginBottom: '2.5rem',
        position: 'relative', overflow: 'hidden', color: 'white',
        boxShadow: '0 20px 40px rgba(8, 45, 20, 0.2)'
      }}>
        <div style={{ position: 'absolute', right: '-10px', top: '-10px', fontSize: '9rem', opacity: 0.1, transform: 'rotate(15deg)' }}>🌾</div>
        <div style={{ position: 'absolute', right: '140px', bottom: '-20px', fontSize: '7rem', opacity: 0.08, transform: 'rotate(-10deg)' }}>🚜</div>
        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '6px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{greeting}</p>
        <h1 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, marginBottom: '10px', letterSpacing: '-0.03em' }}>
          {user?.fullName?.split(' ')[0] || 'Farmer'} <span style={{ opacity: 0.8 }}>👋</span>
        </h1>
        <p style={{ opacity: 0.9, marginBottom: '1.5rem', fontSize: '1.05rem', maxWidth: '500px' }}>
          {t('welcomeSub', lang)}
        </p>
        <div className="d-flex gap-3 flex-wrap mt-4">
          <span style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <i className="fas fa-map-marker-alt me-2" style={{ color: 'var(--gold-light)' }}></i>{user?.district}, {user?.state}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <i className="fas fa-seedling me-2" style={{ color: 'var(--green-light)' }}></i>{user?.primaryCrop}
          </span>
          <span style={{
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '0.9rem',
            fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <i className="fas fa-ruler-combined me-2" style={{ color: 'var(--gold)' }}></i>{user?.landSizeAcres} {t('acres', lang)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="km-stats-grid">
        {[
          { label: t('pestReports', lang), value: loading ? '...' : pestCount, icon: 'fa-bug', color: 'red', sub: t('totalSeason', lang) },
          { label: t('landSize', lang), value: `${user?.landSizeAcres || 0}`, icon: 'fa-ruler-combined', color: 'green', sub: t('acres', lang) },
          { label: t('category', lang), value: user?.category || 'GEN', icon: 'fa-id-card', color: 'gold', sub: t('farmerCategory', lang) },
          { label: t('income', lang), value: `₹${((user?.annualIncome || 0) / 1000).toFixed(0)}K`, icon: 'fa-coins', color: 'sky', sub: t('annualIncome', lang) },
        ].map((s, i) => (
          <div className="stagger-enter" key={i}>
            <div className={`km-stat-card ${s.color}`}>
              <div className="stat-label">{s.label}</div>
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
            <h5 style={{ margin: 0, fontWeight: 700 }}>{t('quickActions', lang)}</h5>
            <small style={{ color: 'var(--text-light)' }}>{t('quickActionsSub', lang)}</small>
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
            <h5 style={{ margin: 0, fontWeight: 700 }}>{t('farmingTips', lang)}</h5>
            <small style={{ color: 'var(--text-light)' }}>{t('farmingTipsSub', lang)}</small>
          </div>
        </div>
        <div className="row g-3">
          {[
            { icon: '💧', tip: t('tip1', lang) },
            { icon: '🌿', tip: t('tip2', lang) },
            { icon: '🌡️', tip: t('tip3', lang) },
          ].map((t, i) => (
            <div className="col-md-4" key={i}>
              <div style={{ background: 'var(--green-mist)', borderRadius: 'var(--radius-sm)', padding: '1rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{t.icon}</div>
                <p style={{ fontSize: '0.84rem', margin: 0, fontWeight: 500 }}>{t.tip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;