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

/* ── score ring component ── */
const ScoreRing = ({ score, size = 72, strokeWidth = 6 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#1a6b2f' : score >= 60 ? '#e8a820' : '#c0392b';
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#e8f5ec" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s ease' }} />
      <text x="50%" y="50%" textAnchor="middle" dy="0.35em"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: size * 0.2, fontWeight: 800, fill: color, fontFamily: 'var(--font-display)' }}>
        {score}
      </text>
    </svg>
  );
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

/* ── medal helper ── */
const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

/* ── mapping translation helpers ── */
const MARATHI_MAPPINGS = {
  // Seasons
  'KHARIF': 'खरीप (Kharif)',
  'RABI': 'रब्बी (Rabi)',
  'ZAID': 'उन्हाळी (Zaid)',
  'WHOLE YEAR': 'वर्षभर',
  
  // Soil Types
  'Black Soil': 'काळी माती',
  'Black Cotton Soil': 'काळी कापसाची माती',
  'Sandy Soil': 'वाळूमय माती',
  'Loamy Soil': 'लोमी माती',
  'Red Soil': 'लाल माती',
  'Clay Soil': 'चिकन माती',
  
  // Water Requirement
  'High': 'जास्त',
  'Medium': 'मध्यम',
  'Low': 'कमी',

  // Irrigation
  'Rainfed': 'कोरडवाहू (पाऊस)',
  'Borewell': 'बोअरवेल',
  'Well': 'विहीर',
  'River': 'नदी',
  'Canal': 'कालवा',
  'Farm Pond': 'शेततळे',
  'Drip Irrigation': 'ठिबक सिंचन',

  // Months
  'January': 'January', 'February': 'February', 'March': 'March', 'April': 'April',
  'May': 'May', 'June': 'June', 'July': 'July', 'August': 'August',
  'September': 'September', 'October': 'October', 'November': 'November', 'December': 'December',

  // Crops (English to Marathi mapping)
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
};

const t = (key) => MARATHI_MAPPINGS[key] || key;

const CropRecommendation = () => {
  const { user } = useAuth();
  const [district, setDistrict] = useState(user?.district || '');
  const [month, setMonth] = useState('July');
  const [irrigation, setIrrigation] = useState('Rainfed');
  const [soilType, setSoilType] = useState('Black Soil');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedIdx, setExpandedIdx] = useState(null);

  const toggleExpand = (idx) => setExpandedIdx(prev => prev === idx ? null : idx);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!district.trim()) return;
    setLoading(true); setError(''); setData(null); setExpandedIdx(null);
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
          <div className="km-breadcrumb">🏠 Home <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>Crop Recommendation</span></div>
          <h1><i className="fas fa-seedling me-2 icon-spin-in" style={{ color: 'var(--green-primary)' }}></i>Crop Recommendation</h1>
          <p>Expert advice for smart farming — Pick the best crop for your land</p>
        </div>
      </div>

      {/* ── Search Card ── */}
      <div className="km-card mb-4">
        <div className="km-card-header">
          <div className="km-card-icon green"><i className="fas fa-filter"></i></div>
          <div>
            <h5 style={{ margin: 0 }}>Smart Crop Selection</h5>
            <small style={{ color: 'var(--text-light)' }}>Enter details below to get recommendations</small>
          </div>
        </div>
        
        <form onSubmit={handleSearch}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* District Dropdown */}
            <div>
              <label className="km-label">District</label>
              <select className="km-input" value={district} onChange={e => setDistrict(e.target.value)} required>
                <option value="">Select District</option>
                <option value="Yavatmal">Yavatmal</option>
                <option value="Buldhana">Buldhana</option>
                <option value="Washim">Washim</option>
                <option value="Amravati">Amravati</option>
                <option value="Hingoli">Hingoli</option>
              </select>
            </div>

            {/* Month Dropdown */}
            <div>
              <label className="km-label">Sowing Month</label>
              <select className="km-input" value={month} onChange={e => setMonth(e.target.value)} required>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Irrigation Dropdown */}
            <div>
              <label className="km-label">Irrigation Availability</label>
              <select className="km-input" value={irrigation} onChange={e => setIrrigation(e.target.value)} required>
                {['Rainfed', 'Borewell', 'Well', 'River', 'Canal', 'Farm Pond', 'Drip Irrigation'].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Soil Type Dropdown */}
            <div>
              <label className="km-label">Soil Type</label>
              <select className="km-input" value={soilType} onChange={e => setSoilType(e.target.value)} required>
                {['Black Soil', 'Black Cotton Soil', 'Sandy Soil', 'Loamy Soil', 'Red Soil', 'Clay Soil'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <button type="submit" className="btn-km-primary" disabled={loading} style={{ padding: '0.75rem 2.5rem' }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm me-2"></span>Analyzing best crops...</>
                : <><i className="fas fa-wand-magic-sparkles"></i>Get Recommendations</>}
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
                  <h4 style={{ margin: 0, color: 'white', fontWeight: 800 }}>Recommendations for {district}</h4>
                  <small style={{ opacity: 0.8 }}>Season: {t(data.season)} — Top 5 Recommended Crops. Click for details.</small>
                </div>
              </div>
            </div>
          </div>

          {/* Cards */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            {data.recommendations?.map((rec, idx) => {
              const isExpanded = expandedIdx === idx;
              return (
                <div className="stagger-enter" key={idx}>
                  <div className="km-card" style={{
                    borderLeft: `4px solid ${rec.score >= 80 ? 'var(--green-primary)' : rec.score >= 60 ? 'var(--gold)' : 'var(--red-alert)'}`,
                    padding: 0, overflow: 'hidden', cursor: 'pointer'
                  }}>
                    {/* Main row */}
                    <div onClick={() => toggleExpand(idx)} style={{
                      display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap',
                      padding: '1.25rem 1.75rem'
                    }}>
                      {/* Rank */}
                      <div style={{ textAlign: 'center', minWidth: 44 }}>
                        <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>{MEDALS[idx]}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>Rank {idx + 1}</div>
                      </div>

                      {/* Crop Info */}
                      <div style={{ flex: 1, minWidth: 140 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: '1.6rem' }}>{getCropEmoji(rec.crop)}</span>
                          <h5 style={{ margin: 0, fontWeight: 800, fontSize: '1.15rem' }}>{t(rec.crop)}</h5>
                        </div>
                        {/* Quick Tags */}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                          {rec.season && <span style={tagStyle('green')}><i className="fas fa-calendar-alt me-1"></i>{t(rec.season)}</span>}
                          {rec.soilType && <span style={tagStyle('earth')}><i className="fas fa-mountain me-1"></i>{t(rec.soilType)}</span>}
                          {rec.waterRequirement && <span style={tagStyle('sky')}><i className="fas fa-droplet me-1"></i>Water: {t(rec.waterRequirement)}</span>}
                          {rec.growthDays && <span style={tagStyle('gold')}><i className="fas fa-clock me-1"></i>{rec.growthDays} Days</span>}
                        </div>
                        {/* Profit */}
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected Profit</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: rec.expectedProfit >= 0 ? 'var(--green-primary)' : 'var(--red-alert)' }}>
                            ₹{Math.abs(rec.expectedProfit).toLocaleString('en-IN')}
                            <small style={{ fontSize: '0.7rem', fontWeight: 500, color: 'var(--text-light)', marginLeft: 4 }}>/Acre</small>
                          </div>
                        </div>
                      </div>

                      {/* Score Ring */}
                      <div style={{ textAlign: 'center' }}>
                        <ScoreRing score={rec.score} />
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700, textTransform: 'uppercase', marginTop: 4 }}>
                          {rec.score >= 80 ? 'Excellent' : rec.score >= 60 ? 'Good' : 'Average'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--green-primary)', marginTop: 6, fontWeight: 600 }}>
                          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} me-1`}></i>
                          {isExpanded ? 'Hide Details' : 'View Breakdown'}
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Panel */}
                    <div style={{
                      maxHeight: isExpanded ? 1200 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.4s ease',
                    }}>
                      <div style={{
                        borderTop: '1px solid var(--border)',
                        padding: '1.25rem 1.75rem',
                        background: 'var(--green-mist)'
                      }}>
                        <h6 style={{ fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          <i className="fas fa-chart-bar" style={{ color: 'var(--green-primary)' }}></i>
                          Detailed Score Breakdown
                        </h6>

                        <div style={{ display: 'grid', gap: '0.75rem' }}>
                          {rec.scoreBreakdown?.map((b, bi) => (
                            <div key={bi} style={{
                              background: 'white', borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border)', padding: '0.85rem 1rem',
                              transition: 'var(--transition)'
                            }}>
                              {/* Factor header row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <span style={{ fontSize: '1.2rem' }}>{FACTOR_ICONS[b.factor.split('(')[1]?.replace(')', '')] || FACTOR_ICONS[b.factor] || '📊'}</span>
                                <span style={{ fontWeight: 700, fontSize: '0.85rem', flex: 1 }}>{b.factor}</span>
                                <MiniBar scored={b.scored} max={b.maxPoints} />
                                <span style={{
                                  fontWeight: 800, fontSize: '0.8rem', fontFamily: 'var(--font-display)',
                                  color: (b.scored / b.maxPoints) >= 0.75 ? 'var(--green-primary)'
                                    : (b.scored / b.maxPoints) >= 0.5 ? 'var(--gold)' : 'var(--red-alert)',
                                  minWidth: 55, textAlign: 'right'
                                }}>
                                  {b.scored}/{b.maxPoints} गुण
                                </span>
                              </div>
                              {/* Reason text */}
                              <div style={{
                                fontSize: '0.82rem', color: 'var(--text-mid)', lineHeight: 1.6,
                                paddingLeft: 34, borderLeft: '3px solid var(--green-pale)', marginLeft: 4
                              }}>
                                {b.reason}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="km-card mt-4" style={{ background: 'var(--green-mist)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
              <div className="km-card-icon green"><i className="fas fa-chart-pie"></i></div>
              <div>
                <h6 style={{ margin: 0, fontWeight: 700 }}>Scoring Model (Total 100 Points)</h6>
                <small style={{ color: 'var(--text-light)' }}>How do we determine suitability for your farm?</small>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { label: 'Season', pts: 15, icon: '📅' },
                { label: 'Climate', pts: 20, icon: '🌤️' },
                { label: 'Soil', pts: 15, icon: '🪨' },
                { label: 'Irrigation', pts: 15, icon: '💧' },
                { label: 'Profit', pts: 25, icon: '💰' },
                { label: 'Growth', pts: 5, icon: '⏱️' },
                { label: 'Market', pts: 5, icon: '📈' },
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '0.35rem 0.7rem', borderRadius: 20,
                  background: 'white', border: '1px solid var(--border)',
                  fontSize: '0.78rem', fontWeight: 600
                }}>
                  <span>{f.icon}</span>
                  <span>{f.label}</span>
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
          <h5>Find the best crops for your farm</h5>
          <p>Fill in the details and get AI-powered recommendations</p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="km-loading-overlay">
          <div className="km-spinner"></div>
          <p>Analyzing farm data, please wait...</p>
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
