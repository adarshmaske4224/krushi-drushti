import React, { useState } from 'react';
import { cropRecommendAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

/* ── crop emoji helper ── */
const CROP_EMOJIS = {
  rice: '🌾', wheat: '🌾', soybean: '🫘', cotton: '🧵', sugarcane: '🎋',
  maize: '🌽', jowar: '🌾', bajra: '🌾', onion: '🧅', tomato: '🍅',
  potato: '🥔', groundnut: '🥜', sunflower: '🌻', turmeric: '🟡',
  chilli: '🌶️', gram: '🫘', tur: '🫘', moong: '🫘', urad: '🫘',
  banana: '🍌', pomegranate: '🍎', grapes: '🍇', mango: '🥭',
};
const getCropEmoji = (name) => {
  const key = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(CROP_EMOJIS)) { if (key.includes(k)) return v; }
  return '🌱';
};

/* ── factor icons ── */
const FACTOR_ICONS = {
  'हवामान अनुकूलता (Climate)': '🌤️',
  'मातीची सुसंगतता (Soil)': '🪨',
  'हंगाम सुसंगतता (Season)': '📅',
  'पाणी उपलब्धता (Irrigation)': '💧',
  'नफ्याची क्षमता (Profit)': '💰',
  'पीक कालावधी (Growth)': '⏱️',
  'बाजार मागणी (Market)': '📈',
};


/* ── mini progress bar ── */
const MiniBar = ({ scored, max }) => {
  const pct = max > 0 ? (scored / max) * 100 : 0;
  const color = pct >= 75 ? 'var(--green-primary)' : pct >= 50 ? 'var(--gold)' : 'var(--red-alert)';
  return (
    <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#e8f5ec', overflow: 'hidden', minWidth: 60 }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.8s ease' }} />
    </div>
  );
};


/* ── mapping translation helpers ── */
/* ── mapping translation helpers ── */
const LOCALES = {
  en: {
    // Page Header
    breadcrumbHome: 'Home',
    pageTitle: 'Crop Recommendation',
    pageSubtitle: 'Expert advice for smart farming — Pick the best crop for your land',
    
    // Search Card
    searchCardTitle: 'Smart Crop Selection',
    searchCardSubtitle: 'Enter details below to get recommendations',
    labelDistrict: 'District',
    labelSowingMonth: 'Sowing Month',
    labelIrrigation: 'Irrigation Availability',
    labelSoilType: 'Soil Type',
    btnGetRecommendations: 'Get Recommendations',
    btnAnalyzing: 'Analyzing best crops...',
    selectDistrict: 'Select District',

    // Results Summary
    resultsFor: 'Recommendations for',
    season: 'Season',
    top5Crops: 'Top 5 Recommended Crops. Click for details.',
    
    // Card Details
    rank: 'Rank',
    waterRequirement: 'Water',
    days: 'Days',
    expectedProfit: 'Expected Profit',
    perAcre: '/Acre',
    hideDetails: 'Hide Details',
    viewBreakdown: 'View Breakdown',
    
    // Status
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    breakdownTitle: 'Detailed Score Breakdown',
    points: 'Points',

    // Legend
    spendingModel: 'Scoring Model (Total 100 Points)',
    spendingModelSub: 'How do we determine suitability for your farm?',
    
    // Factors
    'Climate': 'Climate',
    'Soil': 'Soil',
    'Season': 'Season',
    'Irrigation': 'Irrigation',
    'Profit': 'Profit',
    'Growth': 'Growth',
    'Market': 'Market',

    // Empty/Loading
    emptyTitle: 'Find the best crops for your farm',
    emptySub: 'Fill in the details and get AI-powered recommendations',
    loadingText: 'Analyzing farm data, please wait...',

    // Data mappings
    'KHARIF': 'Kharif',
    'RABI': 'Rabi',
    'ZAID': 'Zaid',
    'WHOLE YEAR': 'Whole Year',
    'Black Soil': 'Black Soil',
    'Black Cotton Soil': 'Black Cotton Soil',
    'Sandy Soil': 'Sandy Soil',
    'Loamy Soil': 'Loamy Soil',
    'Red Soil': 'Red Soil',
    'Clay Soil': 'Clay Soil',
    'High': 'High',
    'Medium': 'Medium',
    'Low': 'Low',
    'Rainfed': 'Rainfed',
    'Borewell': 'Borewell',
    'Well': 'Well',
    'River': 'River',
    'Canal': 'Canal',
    'Farm Pond': 'Farm Pond',
    'Drip Irrigation': 'Drip Irrigation',
    'Rice': 'Rice',
    'Wheat': 'Wheat',
    'Soybean': 'Soybean',
    'Cotton': 'Cotton',
    'Sugarcane': 'Sugarcane',
    'Maize': 'Maize',
    'Jowar': 'Jowar',
    'Bajra': 'Bajra',
    'Onion': 'Onion',
    'Tomato': 'Tomato',
    'Potato': 'Potato',
    'Groundnut': 'Groundnut',
    'Sunflower': 'Sunflower',
    'Turmeric': 'Turmeric',
    'Chilli': 'Chilli',
    'Gram': 'Gram',
    'Tur': 'Tur',
    'Tur (Arhar)': 'Tur',
    'Moong': 'Moong',
    'Urad': 'Urad',
    'Banana': 'Banana',
    'Pomegranate': 'Pomegranate',
    'Grapes': 'Grapes',
    'Mango': 'Mango',
    'Grain': 'Grain Crops',
    'PulseOilseed': 'Pulses & Oilseeds',
    'Vegetable': 'Vegetables',
    'Fruit': 'Fruits'
  },
  mr: {
    // Page Header
    breadcrumbHome: 'मुख्यपृष्ठ (Home)',
    pageTitle: 'पीक शिफारस (Crop Recommendation)',
    pageSubtitle: 'स्मार्ट शेतीसाठी तज्ञ सल्ला — तुमच्या जमिनीसाठी सर्वोत्तम पीक निवडा',
    
    // Search Card
    searchCardTitle: 'स्मार्ट पीक निवड',
    searchCardSubtitle: 'शिफारसी मिळवण्यासाठी खालील तपशील भरा',
    labelDistrict: 'जिल्हा',
    labelSowingMonth: 'पेरणीचा महिना',
    labelIrrigation: 'पाण्याची उपलब्धता',
    labelSoilType: 'मातीचा प्रकार',
    btnGetRecommendations: 'शिफारसी मिळवा',
    btnAnalyzing: 'सर्वोत्तम पिकांचे विश्लेषण करत आहोत...',
    selectDistrict: 'जिल्हा निवडा',

    // Results Summary
    resultsFor: 'साठी शिफारसी',
    season: 'हंगाम',
    top5Crops: 'शीर्ष ५ शिफारस केलेली पिके. तपशीलांसाठी क्लिक करा.',
    
    // Card Details
    rank: 'क्रमांक',
    waterRequirement: 'पाणी पात्रता',
    days: 'दिवस',
    expectedProfit: 'पेक्षित नफा',
    perAcre: '/एकर',
    hideDetails: 'तपशील लपवा',
    viewBreakdown: 'तपशील पहा',
    
    // Status
    excellent: 'उत्कृष्ट',
    good: 'चांगले',
    average: 'सरासरी',
    breakdownTitle: 'तपशीलवार गुण विभागणी',
    points: 'गुण',

    // Legend
    spendingModel: 'स्कोअरिंग मॉडेल (एकूण १०० गुण)',
    spendingModelSub: 'आम्ही तुमच्या शेतीसाठी योग्यता कशी ठरवतो?',

    // Factors
    'Climate': 'हवामान',
    'Soil': 'माती',
    'Season': 'हंगाम',
    'Irrigation': 'सिंचन',
    'Profit': 'नफा',
    'Growth': 'वाढ',
    'Market': 'बाजार',
    'Grain': 'धान्य पीक (Grain Crops)',
    'PulseOilseed': 'कडधान्य आणि तेलबिया (Pulses & Oilseeds)',
    'Vegetable': 'भाजीपाला (Vegetables)',
    'Fruit': 'फळे (Fruits)',

    // Empty/Loading
    emptyTitle: 'तुमच्या शेतासाठी सर्वोत्तम पिके शोधा',
    emptySub: 'तपशील भरा आणि AI-आधारित शिफारसी मिळवा',
    loadingText: 'शेतातील डेटाचे विश्लेषण करत आहोत, कृपया प्रतीक्षा करा...',

    // Data mappings
    'KHARIF': 'खरीप (Kharif)',
    'RABI': 'रब्बी (Rabi)',
    'ZAID': 'उन्हाळी (Zaid)',
    'WHOLE YEAR': 'वर्षभर',
    'Black Soil': 'काळी माती',
    'Black Cotton Soil': 'काळी कापसाची माती',
    'Sandy Soil': 'वाळूमय माती',
    'Loamy Soil': 'लोमी माती',
    'Red Soil': 'लाल माती',
    'Clay Soil': 'चिकन माती',
    'High': 'जास्त',
    'Medium': 'मध्यम',
    'Low': 'कमी',
    'Rainfed': 'कोरडवाहू (पाऊस)',
    'Borewell': 'बोअरवेल',
    'Well': 'विहीर',
    'River': 'नदी',
    'Canal': 'कालवा',
    'Farm Pond': 'शेततळे',
    'Drip Irrigation': 'ठिबक सिंचन',
    'Rice': 'भात (Rice)',
    'Wheat': 'गहू (Wheat)',
    'Soybean': 'सोयाबीन (Soybean)',
    'Cotton': 'कापूस (Cotton)',
    'Sugarcane': 'ऊस (Sugarcane)',
    'Maize': 'मका (Maize)',
    'Jowar': 'ज्वारी (Jowar)',
    'Bajra': 'बाजरी (Bajra)',
    'Onion': 'कांदा (Onion)',
    'Tomato': 'टोमॅटो (Tomato)',
    'Potato': 'बटाटा (Potato)',
    'Groundnut': 'भुईमूग (Groundnut)',
    'Sunflower': 'सूर्यफूल (Sunflower)',
    'Turmeric': 'हळद (Turmeric)',
    'Chilli': 'मिरची (Chilli)',
    'Gram': 'हरभरा (Gram)',
    'Tur': 'तूर (Tur)',
    'Tur (Arhar)': 'तूर (Tur)',
    'Moong': 'मूग (Moong)',
    'Urad': 'उडीद (Urad)',
    'Banana': 'केळी (Banana)',
    'Pomegranate': 'डाळिंब (Pomegranate)',
    'Grapes': 'द्राक्षे (Grapes)',
    'Mango': 'आंबा (Mango)'
  }
};

const t = (key, lang = 'en') => {
  const dictionary = LOCALES[lang] || LOCALES.en;
  return dictionary[key] || key;
};

const CropRecommendation = () => {
  const { user } = useAuth();
  const [district, setDistrict] = useState(user?.district || '');
  const [month, setMonth] = useState('July');
  const [irrigation, setIrrigation] = useState('Rainfed');
  const [soilType, setSoilType] = useState('Black Soil');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null); // category-index

  const toggleExpand = (cat, idx) => {
    const id = `${cat}-${idx}`;
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!district.trim()) return;
    setLoading(true); setError(''); setData(null); setExpandedId(null);
    try {
      const res = await cropRecommendAPI.getRecommendations({
        district: district.trim(),
        month,
        irrigation,
        soilType
      });
      setData(res.data);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error
        || 'Something went wrong. Please try again.';
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="fade-in" id="crop-recommendation-page">
      {/* ── Page Header ── */}
      <div className="km-page-header d-flex justify-content-between align-items-start">
        <div>
          <div className="km-breadcrumb">🏠 {t('breadcrumbHome', user?.preferredLanguage)} <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>{t('pageTitle', user?.preferredLanguage)}</span></div>
          <h1><i className="fas fa-seedling me-2 icon-spin-in" style={{ color: 'var(--green-primary)' }}></i>{t('pageTitle', user?.preferredLanguage)}</h1>
          <p>{t('pageSubtitle', user?.preferredLanguage)}</p>
        </div>
      </div>

      {/* ── Search Card ── */}
      <div className="km-card mb-4">
        <div className="km-card-header">
          <div className="km-card-icon green"><i className="fas fa-filter"></i></div>
          <div>
            <h5 style={{ margin: 0 }}>{t('searchCardTitle', user?.preferredLanguage)}</h5>
            <small style={{ color: 'var(--text-light)' }}>{t('searchCardSubtitle', user?.preferredLanguage)}</small>
          </div>
        </div>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* District Dropdown */}
            <div>
              <label className="km-label">{t('labelDistrict', user?.preferredLanguage)}</label>
              <select className="km-input" value={district} onChange={e => setDistrict(e.target.value)} required>
                <option value="">{t('selectDistrict', user?.preferredLanguage)}</option>
                <option value="Yavatmal">Yavatmal</option>
                <option value="Buldhana">Buldhana</option>
                <option value="Washim">Washim</option>
                <option value="Amravati">Amravati</option>
                <option value="Hingoli">Hingoli</option>
              </select>
            </div>

            {/* Month Dropdown */}
            <div>
              <label className="km-label">{t('labelSowingMonth', user?.preferredLanguage)}</label>
              <select className="km-input" value={month} onChange={e => setMonth(e.target.value)} required>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Irrigation Dropdown */}
            <div>
              <label className="km-label">{t('labelIrrigation', user?.preferredLanguage)}</label>
              <select className="km-input" value={irrigation} onChange={e => setIrrigation(e.target.value)} required>
                {['Rainfed', 'Borewell', 'Well', 'River', 'Canal', 'Farm Pond', 'Drip Irrigation'].map(i => (
                  <option key={i} value={i}>{t(i, user?.preferredLanguage)}</option>
                ))}
              </select>
            </div>

            {/* Soil Type Dropdown */}
            <div>
              <label className="km-label">{t('labelSoilType', user?.preferredLanguage)}</label>
              <select className="km-input" value={soilType} onChange={e => setSoilType(e.target.value)} required>
                {['Black Soil', 'Black Cotton Soil', 'Sandy Soil', 'Loamy Soil', 'Red Soil', 'Clay Soil'].map(s => (
                  <option key={s} value={s}>{t(s, user?.preferredLanguage)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <button type="submit" className="btn-km-primary" disabled={loading} style={{ padding: '0.75rem 2.5rem' }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>{t('btnAnalyzing', user?.preferredLanguage)}</>
                : <><i className="fas fa-wand-magic-sparkles"></i>{t('btnGetRecommendations', user?.preferredLanguage)}</>}
            </button>
          </div>
        </form>
      </div>

      {/* ── Error ── */}
      {error && <div className="km-alert error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}

      {/* ── Results ── */}
      {data && (
        <div className="fade-in">
          {/* Summary Banner */}
          <div className="km-card mb-4" style={{
            background: 'linear-gradient(135deg, var(--green-dark) 0%, var(--green-primary) 100%)',
            color: 'white', border: 'none', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', right: -10, top: -10, fontSize: '5rem', opacity: 0.1 }}>🌾</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <i className="fas fa-map-location-dot" style={{ fontSize: '1.5rem', color: 'var(--gold-light)' }}></i>
                <div>
                  <h4 style={{ margin: 0, color: 'white', fontWeight: 800 }}>{t('resultsFor', user?.preferredLanguage)} {district}</h4>
                  <small style={{ opacity: 0.8 }}>{t('season', user?.preferredLanguage)}: {t(data.season, user?.preferredLanguage)} — {t('top5Crops', user?.preferredLanguage)}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Grouped results by category - Table View */}
          {['Grain', 'PulseOilseed', 'Vegetable', 'Fruit'].map((cat) => (
            <div key={cat} className="km-card mb-4" style={{ padding: '1.5rem' }}>
              <div className="d-flex align-items-center gap-3 mb-3 pb-2" style={{ borderBottom: '2px solid var(--green-pale)' }}>
                <div style={{ fontSize: '1.5rem' }}>
                  {cat === 'Grain' ? '🌾' : cat === 'PulseOilseed' ? '🫘' : cat === 'Vegetable' ? '🥦' : '🍎'}
                </div>
                <h4 style={{ margin: 0, fontWeight: 800, color: 'var(--green-dark)' }}>{t(cat, user?.preferredLanguage)}</h4>
              </div>

              <div className="table-responsive">
                <table className="km-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', color: 'var(--text-light)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '0.75rem 1rem' }}>{user?.preferredLanguage === 'mr' ? 'पीक (Crop)' : 'Crop'}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{user?.preferredLanguage === 'mr' ? 'गुण (Score)' : 'Score'}</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>{user?.preferredLanguage === 'mr' ? 'अंदाजित नफा (Profit)' : 'Expected Profit'}</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recommendations[cat]?.length > 0 ? (
                      data.recommendations[cat].map((rec, idx) => {
                        const id = `${cat}-${idx}`;
                        const isExpanded = expandedId === id;
                        return (
                          <React.Fragment key={id}>
                            <tr 
                              onClick={() => toggleExpand(cat, idx)}
                              className="stagger-enter"
                              style={{ 
                                background: 'white', 
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                                transition: 'transform 0.2s ease',
                                borderRadius: '12px'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                              <td style={{ padding: '1.25rem 1rem', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px', borderLeft: `5px solid ${rec.score >= 80 ? 'var(--green-primary)' : rec.score >= 60 ? 'var(--gold)' : 'var(--red-alert)'}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <span style={{ fontSize: '1.5rem' }}>{getCropEmoji(rec.crop)}</span>
                                  <div>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-dark)' }}>{t(rec.crop, user?.preferredLanguage)}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{idx + 1}. {t('rank', user?.preferredLanguage)}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '1.25rem 1rem', textAlign: 'center' }}>
                                <div style={{ 
                                  display: 'inline-block',
                                  padding: '4px 12px',
                                  borderRadius: '20px',
                                  background: rec.score >= 80 ? '#e8f5ec' : rec.score >= 60 ? '#fef9e7' : '#fdeded',
                                  color: rec.score >= 80 ? 'var(--green-primary)' : rec.score >= 60 ? 'var(--gold-dark)' : 'var(--red-alert)',
                                  fontWeight: 800,
                                  fontSize: '1rem'
                                }}>
                                  {rec.score}%
                                </div>
                              </td>
                              <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--green-primary)' }}>
                                  ₹{rec.expectedProfit.toLocaleString('en-IN')}
                                </div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>{t('perAcre', user?.preferredLanguage)}</div>
                              </td>
                              <td style={{ padding: '1.25rem 1rem', borderTopRightRadius: '12px', borderBottomRightRadius: '12px', textAlign: 'center', color: 'var(--green-primary)' }}>
                                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                              </td>
                            </tr>
                            
                            {/* Breakdown Row */}
                            {isExpanded && (
                              <tr>
                                <td colSpan="4" style={{ padding: '0 0 1rem 0' }}>
                                  <div style={{ 
                                    background: '#f9fbf9', 
                                    borderRadius: '12px', 
                                    margin: '0 1rem',
                                    padding: '1.5rem',
                                    border: '1px solid var(--green-pale)',
                                    animation: 'slideDown 0.3s ease'
                                  }}>
                                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                                      {rec.season && <span style={tagStyle('green')}><i className="fas fa-calendar-alt me-1"></i>{t(rec.season, user?.preferredLanguage)}</span>}
                                      {rec.soilType && <span style={tagStyle('earth')}><i className="fas fa-mountain me-1"></i>{t(rec.soilType, user?.preferredLanguage)}</span>}
                                      {rec.waterRequirement && <span style={tagStyle('sky')}><i className="fas fa-droplet me-1"></i>{t('waterRequirement', user?.preferredLanguage)}: {t(rec.waterRequirement, user?.preferredLanguage)}</span>}
                                      {rec.growthDays && <span style={tagStyle('gold')}><i className="fas fa-clock me-1"></i>{rec.growthDays} {t('days', user?.preferredLanguage)}</span>}
                                    </div>

                                    <h6 style={{ fontWeight: 800, marginBottom: '1rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                      <i className="fas fa-chart-line" style={{ color: 'var(--green-primary)' }}></i>
                                      {t('breakdownTitle', user?.preferredLanguage)}
                                    </h6>

                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                      {rec.scoreBreakdown?.map((b, bi) => (
                                        <div key={bi} style={{
                                          background: 'white', borderRadius: '10px',
                                          border: '1px solid var(--border)', padding: '1rem'
                                        }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                            <span style={{ fontSize: '1.2rem' }}>{FACTOR_ICONS[b.factor.split('(')[1]?.replace(')', '')] || FACTOR_ICONS[b.factor] || '📊'}</span>
                                            <span style={{ fontWeight: 700, fontSize: '0.9rem', flex: 1, color: 'var(--text-dark)' }}>{t(b.factor.split('(')[1]?.replace(')', '') || b.factor, user?.preferredLanguage)}</span>
                                            <MiniBar scored={b.scored} max={b.maxPoints} />
                                            <span style={{ fontWeight: 800, fontSize: '0.85rem', minWidth: 50, textAlign: 'right', color: 'var(--text-dark)' }}>{b.scored}/{b.maxPoints}</span>
                                          </div>
                                          <div style={{ fontSize: '0.85rem', color: 'var(--text-mid)', paddingLeft: 36, borderLeft: '3px solid var(--green-pale)', marginLeft: 5 }}>{b.reason}</div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-4" style={{ color: 'var(--text-light)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                          No suitable crops found for this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="km-card mt-4" style={{ background: 'var(--green-mist)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
              <div className="km-card-icon green"><i className="fas fa-chart-pie"></i></div>
              <div>
                <h6 style={{ margin: 0, fontWeight: 700 }}>{t('spendingModel', user?.preferredLanguage)}</h6>
                <small style={{ color: 'var(--text-light)' }}>{t('spendingModelSub', user?.preferredLanguage)}</small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Season', pts: 15, icon: '📅' },
                { label: 'Climate', pts: 25, icon: '🌤️' },
                { label: 'Soil', pts: 20, icon: '🪨' },
                { label: 'Irrigation', pts: 15, icon: '💧' },
                { label: 'Profit', pts: 25, icon: '💰' },
                { label: 'Growth', pts: 10, icon: '⏱️' },
                { label: 'Market', pts: 5, icon: '📈' },
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.35rem 0.7rem', borderRadius: 20,
                  background: 'white', border: '1px solid var(--border)',
                  fontSize: '0.78rem', fontWeight: 600
                }}>
                  <span>{f.icon}</span>
                  <span>{t(f.label, user?.preferredLanguage)}</span>
                  <span style={{
                    background: 'var(--green-primary)', color: 'white',
                    borderRadius: 10, padding: '1px 7px', fontSize: '0.65rem', fontWeight: 700
                  }}>{f.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!data && !loading && (
        <div className="km-empty-state">
          <div className="empty-icon">🌱</div>
          <h5>{t('emptyTitle', user?.preferredLanguage)}</h5>
          <p>{t('emptySub', user?.preferredLanguage)}</p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="km-loading-overlay">
          <div className="km-spinner"></div>
          <p>{t('loadingText', user?.preferredLanguage)}</p>
        </div>
      )}
    </div>
  );
};

/* ── tag style helper ── */
const tagStyle = (variant) => {
  const colors = {
    green: { bg: '#e8f5ec', color: '#1a6b2f' },
    earth: { bg: '#f5ede6', color: '#6b4c2a' },
    sky: { bg: '#e3f4f6', color: '#2196a8' },
    gold: { bg: '#fef9e7', color: '#c48d10' },
  };
  const c = colors[variant] || colors.green;
  return {
    background: c.bg, color: c.color,
    padding: '2px 8px', borderRadius: 12,
    fontSize: '0.68rem', fontWeight: 600,
    display: 'inline-flex', alignItems: 'center'
  };
};

export default CropRecommendation;
