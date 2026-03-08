import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { priceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const COMMODITIES = ['Wheat','Rice','Onion','Tomato','Cotton','Soybean','Potato','Maize','Sugarcane'];
const STATES = ['Maharashtra','Rajasthan','Punjab','Karnataka','Madhya Pradesh','Uttar Pradesh','Gujarat','Haryana'];

const CropPrices = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    commodity: user?.primaryCrop || 'Wheat',
    state: user?.state || 'Maharashtra',
    market: user?.district || '',
    district: user?.district || ''
  });
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setData(null);
    try {
      const res = await priceAPI.getPrice(form.commodity, form.state, form.market, form.district);
      setData(res.data);
    } catch(err) {
      setError('Could not fetch price data. Try different market name.');
    } finally { setLoading(false); }
  };

  const trendData = data?.weeklyTrend?.map((t,i) => ({
    day: t.arrivalDate || `Day ${i+1}`,
    modal: t.modalPrice,
    min:   t.minPrice,
    max:   t.maxPrice,
  })) || [];

  const priceChange = trendData.length >= 2
    ? trendData[trendData.length-1]?.modal - trendData[0]?.modal : 0;

  return (
    <div className="fade-in">
      <div className="km-page-header">
        <div className="km-breadcrumb">🏠 Home <i className="fas fa-chevron-right" style={{fontSize:8}}></i> <span>Crop Prices</span></div>
        <h1><i className="fas fa-indian-rupee-sign me-2" style={{color:'var(--green-primary)'}}></i>Crop Market Prices</h1>
        <p className="marathi">पीक बाजारभाव — आजचे ताजे दर</p>
      </div>

      {/* Search Form */}
      <div className="km-card mb-4">
        <div className="km-card-header">
          <div className="km-card-icon green"><i className="fas fa-search"></i></div>
          <div><h5 style={{margin:0}}>Search Mandi Price</h5><small className="marathi" style={{color:'var(--text-light)'}}>मंडई भाव शोधा</small></div>
        </div>
        <form onSubmit={handleSearch}>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="km-label">Commodity / पीक</label>
              <select className="km-input" value={form.commodity} onChange={e=>set('commodity',e.target.value)}>
                {COMMODITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="km-label">State / राज्य</label>
              <select className="km-input" value={form.state} onChange={e=>set('state',e.target.value)}>
                {STATES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-3">
              <label className="km-label">Market / बाजार</label>
              <input className="km-input" placeholder="e.g. Lasalgaon" value={form.market}
                onChange={e=>set('market',e.target.value)} required />
            </div>
            <div className="col-md-3">
              <label className="km-label">District / जिल्हा</label>
              <input className="km-input" placeholder="e.g. Nashik" value={form.district}
                onChange={e=>set('district',e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-km-primary mt-3" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Fetching...</>
                     : <><i className="fas fa-search"></i>Get Live Price / ताजा भाव मिळवा</>}
          </button>
        </form>
      </div>

      {error && <div className="km-alert error"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}

      {data && (
        <div className="fade-in">
          {/* Price Cards */}
          <div className="row g-3 mb-4">
            {[
              { label:'Modal Price', labelMr:'मुख्य भाव', value:`₹${data.modalPrice?.toLocaleString()}`, sub:'/quintal', color:'green' },
              { label:'Min Price',   labelMr:'किमान भाव', value:`₹${data.minPrice?.toLocaleString()}`,   sub:'/quintal', color:'sky' },
              { label:'Max Price',   labelMr:'कमाल भाव',  value:`₹${data.maxPrice?.toLocaleString()}`,   sub:'/quintal', color:'gold' },
              { label:'7-Day Trend', labelMr:'७ दिवस',    value: priceChange >= 0 ? `+₹${priceChange?.toFixed(0)}` : `-₹${Math.abs(priceChange)?.toFixed(0)}`,
                sub:'change', color: priceChange >= 0 ? 'green' : 'red' },
            ].map((c,i) => (
              <div className="col-md-3 col-sm-6" key={i}>
                <div className={`km-stat-card ${c.color}`}>
                  <div className="stat-label">{c.label}<br/><span className="marathi" style={{fontSize:'0.7rem'}}>{c.labelMr}</span></div>
                  <div className="stat-value mt-1" style={{
                    color: c.color==='green'?'var(--green-primary)':c.color==='gold'?'var(--gold)':
                           c.color==='sky'?'var(--sky)':'var(--red-alert)'
                  }}>{c.value}</div>
                  <div style={{fontSize:'0.75rem',color:'var(--text-light)'}}>{c.sub}</div>
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
                  <h6 style={{margin:0,fontWeight:700}}>Market Details</h6>
                </div>
                {[
                  ['Commodity', data.commodity],
                  ['State', data.state],
                  ['District', data.district],
                  ['Market', data.market],
                  ['Variety', data.variety],
                  ['Grade', data.grade],
                  ['Arrival Date', data.arrivalDate],
                ].map(([k,v]) => (
                  <div key={k} style={{display:'flex',justifyContent:'space-between',
                    padding:'0.5rem 0',borderBottom:'1px solid var(--border)',fontSize:'0.875rem'}}>
                    <span style={{color:'var(--text-light)',fontWeight:500}}>{k}</span>
                    <span style={{fontWeight:600}}>{v || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="col-md-8">
              <div className="km-card h-100">
                <div className="km-card-header">
                  <div className="km-card-icon gold"><i className="fas fa-chart-line"></i></div>
                  <div><h6 style={{margin:0,fontWeight:700}}>7-Day Price Trend</h6>
                  <small className="marathi" style={{color:'var(--text-light)'}}>७ दिवसांचा भाव आलेख</small></div>
                </div>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={trendData} margin={{top:5,right:10,bottom:5,left:10}}>
                      <defs>
                        <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a6b2f" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#1a6b2f" stopOpacity={0.01}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e8f5ec" />
                      <XAxis dataKey="day" tick={{fontSize:10}} />
                      <YAxis tick={{fontSize:10}} tickFormatter={v=>`₹${v}`} />
                      <Tooltip formatter={(v)=>[`₹${v}`,'']} />
                      <Area type="monotone" dataKey="modal" stroke="#1a6b2f" strokeWidth={2.5}
                        fill="url(#priceGrad)" name="Modal Price" dot={{r:4,fill:'#1a6b2f'}} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="km-empty-state"><div className="empty-icon">📈</div><p>No trend data available</p></div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!data && !loading && (
        <div className="km-empty-state">
          <div className="empty-icon">🏪</div>
          <h5>Search for Mandi Prices</h5>
          <p className="marathi">वरील फॉर्म भरा आणि ताजा भाव मिळवा</p>
        </div>
      )}
    </div>
  );
};

export default CropPrices;