import React, { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { priceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COMMODITIES = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Cotton', 'Soybean', 'Potato', 'Maize', 'Sugarcane'];
const STATES = ['Maharashtra', 'Rajasthan', 'Punjab', 'Karnataka', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat', 'Haryana'];

/* ── localization ── */
const LOCALES = {
  en: {
    breadcrumbHome: 'Home',
    pageTitle: 'Crop Market Prices',
    pageSubtitle: 'Crop Market Prices — Latest Daily Rates',
    searchTitle: 'Search Mandi Price',
    searchSub: 'Find market rates',
    labelCommodity: 'Commodity',
    labelState: 'State',
    labelMarket: 'Market',
    labelDistrict: 'District',
    placeholderMarket: 'e.g. Lasalgaon',
    placeholderDistrict: 'e.g. Nashik',
    btnGetPrice: 'Get Live Price',
    btnFetching: 'Fetching...',
    modalPrice: 'Modal Price',
    minPrice: 'Min Price',
    maxPrice: 'Max Price',
    trend7Day: '7-Day Trend',
    quintal: '/quintal',
    change: 'change',
    marketDetails: 'Market Details',
    variety: 'Variety',
    grade: 'Grade',
    arrivalDate: 'Arrival Date',
    priceTrendTitle: '7-Day Price Trend',
    priceTrendSub: '7-day price chart',
    noTrendData: 'No trend data available',
    emptyTitle: 'Search for Mandi Prices',
    emptySub: 'Fill the form above to get live rates',
    errorFetch: 'Could not fetch price data. Try a different market name.',
    
    // Commodities
    'Wheat': 'Wheat', 'Rice': 'Rice', 'Onion': 'Onion', 'Tomato': 'Tomato',
    'Cotton': 'Cotton', 'Soybean': 'Soybean', 'Potato': 'Potato',
    'Maize': 'Maize', 'Sugarcane': 'Sugarcane',
    
    // States
    'Maharashtra': 'Maharashtra', 'Rajasthan': 'Rajasthan', 'Punjab': 'Punjab',
    'Karnataka': 'Karnataka', 'Madhya Pradesh': 'Madhya Pradesh',
    'Uttar Pradesh': 'Uttar Pradesh', 'Gujarat': 'Gujarat', 'Haryana': 'Haryana'
  },
  mr: {
    breadcrumbHome: 'मुख्यपृष्ठ (Home)',
    pageTitle: 'पीक बाजारभाव (Crop Prices)',
    pageSubtitle: 'पीक बाजारभाव — आजचे ताजे दर',
    searchTitle: 'मंडई भाव शोधा',
    searchSub: 'बाजार समितीचे दर तपासा',
    labelCommodity: 'शेतमाल / पीक',
    labelState: 'राज्य',
    labelMarket: 'बाजार समिती',
    labelDistrict: 'जिल्हा',
    placeholderMarket: 'उदा. लासलगाव',
    placeholderDistrict: 'उदा. नाशिक',
    btnGetPrice: 'ताजा भाव मिळवा',
    btnFetching: 'माहिती घेत आहोत...',
    modalPrice: 'मुख्य भाव',
    minPrice: 'किमान भाव',
    maxPrice: 'कमाल भाव',
    trend7Day: '७ दिवसांचा कल',
    quintal: '/क्विंटल',
    change: 'बदल',
    marketDetails: 'बाजार तपशील',
    variety: 'वाण',
    grade: 'प्रत',
    arrivalDate: 'आवक तारीख',
    priceTrendTitle: '७ दिवसांचा भाव आलेख',
    priceTrendSub: 'गेल्या आठवड्यातील दरातील बदल',
    noTrendData: 'कोणीही ट्रेंड डेटा उपलब्ध नाही',
    emptyTitle: 'बाजार भाव शोधा',
    emptySub: 'ताजे दर मिळवण्यासाठी वरील फॉर्म भरा',
    errorFetch: 'भाव माहिती मिळू शकली नाही. कृपया वेगळ्या बाजार समितीचे नाव प्रयत्न करा.',

    // Commodities
    'Wheat': 'गहू (Wheat)', 'Rice': 'भात (Rice)', 'Onion': 'कांदा (Onion)', 'Tomato': 'टोमॅटो (Tomato)',
    'Cotton': 'कापूस (Cotton)', 'Soybean': 'सोयाबीन (Soybean)', 'Potato': 'बटाटा (Potato)',
    'Maize': 'मका (Maize)', 'Sugarcane': 'ऊस (Sugarcane)',

    // States
    'Maharashtra': 'महाराष्ट्र', 'Rajasthan': 'राजस्थान', 'Punjab': 'पंजाब',
    'Karnataka': 'कर्नाटक', 'Madhya Pradesh': 'मध्य प्रदेश',
    'Uttar Pradesh': 'उत्तर प्रदेश', 'Gujarat': 'गुजरात', 'Haryana': 'हरियाणा'
  }
};

const t = (key, lang = 'en') => {
  const dictionary = LOCALES[lang] || LOCALES.en;
  return dictionary[key] || key;
};


const CropPrices = () => {
  const { user } = useAuth();
  const lang = user?.preferredLanguage || 'en';
  
  const [form, setForm] = useState({
    commodity: user?.primaryCrop || 'Wheat',
    state: user?.state || 'Maharashtra',
    market: user?.district || '',
    district: user?.district || ''
  });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setData(null);
    try {
      const res = await priceAPI.getPrice(form.commodity, form.state, form.market, form.district);
      setData(res.data);
    } catch (err) {
      setError(t('errorFetch', lang));
    } finally { setLoading(false); }
  };

  const trendData = data?.weeklyTrend?.map((t, i) => ({
    day: t.arrivalDate || `Day ${i + 1}`,
    modal: t.modalPrice,
    min: t.minPrice,
    max: t.maxPrice,
  })) || [];

  const priceChange = trendData.length >= 2
    ? trendData[trendData.length - 1]?.modal - trendData[0]?.modal : 0;

  return (
    <div className="fade-in" id="crop-prices-page">
      <div className="km-page-header d-flex justify-content-between align-items-start">
        <div>
          <div className="km-breadcrumb">🏠 {t('breadcrumbHome', lang)} <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>{t('pageTitle', lang)}</span></div>
          <h1><i className="fas fa-indian-rupee-sign me-2 icon-spin-in" style={{ color: 'var(--green-primary)' }}></i>{t('pageTitle', lang)}</h1>
          <p>{t('pageSubtitle', lang)}</p>
        </div>
      </div>

      {/* Search Form */}
      <div className="km-card mb-4">
        <div className="km-card-header">
          <div className="km-card-icon green"><i className="fas fa-search"></i></div>
          <div><h5 style={{ margin: 0 }}>{t('searchTitle', lang)}</h5><small style={{ color: 'var(--text-light)' }}>{t('searchSub', lang)}</small></div>
        </div>
        <form onSubmit={handleSearch}>
          <div className="km-stats-grid">
            <div>
              <label className="km-label">{t('labelCommodity', lang)}</label>
              <select className="km-input" value={form.commodity} onChange={e => set('commodity', e.target.value)}>
                {COMMODITIES.map(c => <option key={c} value={c}>{t(c, lang)}</option>)}
              </select>
            </div>
            <div>
              <label className="km-label">{t('labelState', lang)}</label>
              <select className="km-input" value={form.state} onChange={e => set('state', e.target.value)}>
                {STATES.map(s => <option key={s} value={s}>{t(s, lang)}</option>)}
              </select>
            </div>
            <div>
              <label className="km-label">{t('labelMarket', lang)}</label>
              <input className="km-input" placeholder={t('placeholderMarket', lang)} value={form.market}
                onChange={e => set('market', e.target.value)} required />
            </div>
            <div>
              <label className="km-label">{t('labelDistrict', lang)}</label>
              <input className="km-input" placeholder={t('placeholderDistrict', lang)} value={form.district}
                onChange={e => set('district', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-km-primary mt-3" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>{t('btnFetching', lang)}</>
              : <><i className="fas fa-search"></i>{t('btnGetPrice', lang)}</>}
          </button>
        </form>
      </div>

      {error && <div className="km-alert error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}

      {data && (
        <div className="fade-in">
          {/* Price Cards */}
          <div className="km-stats-grid">
            {[
              { label: t('modalPrice', lang), value: `₹${data.modalPrice?.toLocaleString()}`, sub: t('quintal', lang), color: 'green' },
              { label: t('minPrice', lang), value: `₹${data.minPrice?.toLocaleString()}`, sub: t('quintal', lang), color: 'sky' },
              { label: t('maxPrice', lang), value: `₹${data.maxPrice?.toLocaleString()}`, sub: t('quintal', lang), color: 'gold' },
              {
                label: t('trend7Day', lang), value: priceChange >= 0 ? `+₹${priceChange?.toFixed(0)}` : `-₹${Math.abs(priceChange)?.toFixed(0)}`,
                sub: t('change', lang), color: priceChange >= 0 ? 'green' : 'red'
              },
            ].map((c, i) => (
              <div className="stagger-enter" key={i}>
                <div className={`km-stat-card ${c.color}`}>
                  <div className="stat-label">{c.label}</div>
                  <div className="stat-value mt-1" style={{
                    color: c.color === 'green' ? 'var(--green-primary)' : c.color === 'gold' ? 'var(--gold)' :
                      c.color === 'sky' ? 'var(--sky)' : 'var(--red-alert)'
                  }}>{c.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{c.sub}</div>
                  <i className="fas fa-indian-rupee-sign stat-icon"></i>
                </div>
              </div>
            ))}
          </div>

          {/* Details */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="km-card h-100">
                <div className="km-card-header">
                  <div className="km-card-icon green"><i className="fas fa-info-circle"></i></div>
                  <h6 style={{ margin: 0, fontWeight: 700 }}>{t('marketDetails', lang)}</h6>
                </div>
                {[
                  [t('labelCommodity', lang), t(data.commodity, lang)],
                  [t('labelState', lang), t(data.state, lang)],
                  [t('labelDistrict', lang), data.district],
                  [t('labelMarket', lang), data.market],
                  [t('variety', lang), data.variety],
                  [t('grade', lang), data.grade],
                  [t('arrivalDate', lang), data.arrivalDate],
                ].map(([k, v]) => (
                  <div key={k} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '0.5rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.875rem'
                  }}>
                    <span style={{ color: 'var(--text-light)', fontWeight: 500 }}>{k}</span>
                    <span style={{ fontWeight: 600 }}>{v || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="col-md-8">
              <div className="km-card h-100">
                <div className="km-card-header">
                  <div className="km-card-icon gold"><i className="fas fa-chart-line"></i></div>
                  <div><h6 style={{ margin: 0, fontWeight: 700 }}>{t('priceTrendTitle', lang)}</h6>
                    <small style={{ color: 'var(--text-light)' }}>{t('priceTrendSub', lang)}</small></div>
                </div>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a6b2f" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#1a6b2f" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8f5ec" />
                      <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${v}`} />
                      <Tooltip formatter={(v) => [`₹${v}`, '']} />
                      <Area type="monotone" dataKey="modal" stroke="#1a6b2f" strokeWidth={2.5}
                        fill="url(#priceGrad)" name={t('modalPrice', lang)} dot={{ r: 4, fill: '#1a6b2f' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="km-empty-state"><div className="empty-icon">📈</div><p>{t('noTrendData', lang)}</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="km-empty-state">
          <div className="empty-icon">🏪</div>
          <h5>{t('emptyTitle', lang)}</h5>
          <p>{t('emptySub', lang)}</p>
        </div>
      )}
    </div>
  );
};

export default CropPrices;