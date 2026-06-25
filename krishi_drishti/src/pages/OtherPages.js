import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { pestAPI, weatherAPI, schemeAPI, smsAPI } from '../services/api';

/* ── localization ── */
const LOCALES = {
  en: {
    home: 'Home',
    pestTitle: 'AI Pest Detection',
    pestSubtitle: 'Pest Detection by AI — Upload a Photo',
    uploadTitle: 'Upload Crop Image',
    uploadSub: 'Choose a photo of your crop',
    dragActive: 'Drop image here...',
    dragIdle: 'Drag & drop or click to upload',
    uploadHint: 'JPG, PNG up to 10MB',
    cropTypeLabel: 'Crop Type',
    btnDetecting: 'Analyzing with AI...',
    btnDetect: 'Detect Pest',
    resultTitle: 'Detection Result',
    resultSub: 'Pest identification results',
    pestLabel: 'Detected Pest',
    confidence: 'Confidence',
    treatmentTitle: 'Treatment',
    historyTitle: 'Detection History',
    historySub: 'Recent pest reports',
    colCrop: 'Crop',
    colPest: 'Pest',
    colConfidence: 'Confidence',
    colLocation: 'Location',
    colDate: 'Date',
    emptyTitle: 'AI Analysis Ready',
    emptySub: 'Upload a crop image and click detect',
    errorUpload: 'Please upload a crop image first.',
    errorDetect: 'Detection failed. Try again.',
    districtAlert: 'District Alert',
    
    // Other Pages (Weather)
    weatherTitle: 'Weather-Based Pest Prediction',
    weatherSubtitle: 'Weather-Based Pest Forecasting',
    locationCropTitle: 'Select Location & Crop',
    locationCropSub: 'Select district and crop',
    labelDistrict: 'District',
    labelState: 'State',
    labelCrop: 'Crop Type',
    btnPredicting: 'Analyzing...',
    btnPredict: 'Predict Pests',
    humidity: 'Humidity',
    rainfall: 'Rainfall',
    wind: 'Wind',
    riskLevel: 'Risk Level',
    advisory: 'Advisory',
    predictedRisks: 'Predicted Pest Risks',
    predictedRisksSub: 'Potential pest threats',
    why: 'Why',
    prevention: 'Prevention',
    sprayTime: 'Best spray time',

    // Schemes
    schemesTitle: 'Government Schemes',
    schemesSubtitle: 'Government Schemes — View eligible schemes for you',
    btnAllSchemes: 'All Schemes',
    btnRecSchemes: 'AI Recommendations',
    loadingSchemes: 'Loading schemes...',
    aiFinding: 'AI is searching for schemes...',
    recommended: 'Recommended',
    active: 'Active',
    aiRecLabel: 'AI Recommendation',
    maxIncome: 'Max Income',
    maxLand: 'Max Land',
    acres: 'acres',
    benefits: 'Benefits',
    applyOnline: 'Apply Online',
    noSchemes: 'No schemes found. Add schemes to database.',
    noRecs: 'No AI recommendations available right now.',

    // SMS Alerts
    alertsTitle: 'My Alert Inbox',
    alertsSubtitle: 'My Alerts — Notification received from KrishiDrishti',
    smsActive: 'Automatic SMS Alerts Active',
    smsActiveSub: 'KrishiDrishti sends automatic SMS for pest, weather, and price changes',
    registered: 'Registered',
    totalAlerts: 'Total Alerts',
    pestAlerts: 'Pest Alerts',
    weatherAlerts: 'Weather Alerts',
    priceAlerts: 'Price Alerts',
    receivedAlerts: 'Received Alerts',
    receivedAlertsSub: 'Information received',
    noAlerts: 'No alerts yet',
    willReceive: 'You will receive SMS alerts automatically when:',
    triggerPest: 'A pest outbreak is detected in your district',
    triggerWeather: 'Extreme weather is forecasted',
    triggerPrice: 'Your crop price changes significantly',
    triggerScheme: 'A new government scheme is available',
    autoSmsNote: 'Alerts will come automatically — no action needed',
    alertSettings: 'Alert Settings',
    alertSettingsSub: 'Choose which alerts you want to receive on your phone',
    alertInstruction: 'Choose which alerts you want to receive on your phone',
    sentTo: 'Alerts sent to',
    phoneHint: 'Update phone number in profile',
    howItWorks: 'How It Works',
    howItWorksSub: 'How the alert system works',
    step1: 'System monitors weather & pests daily',
    step2: 'Risk detected in your district',
    step3: 'Automatic SMS sent to your phone',
    step4: 'Take action before damage occurs',
    
    // Profile
    profileTitle: 'My Profile',
    profileSubtitle: 'My Information',
    primaryCrop: 'Primary Crop',
    farmerDetails: 'Farmer Details',
    farmerDetailsSub: 'Farmer Information',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    state: 'State',
    district: 'District',
    village: 'Village',
    landSize: 'Land Size',
    annualIncome: 'Annual Income',
    category: 'Category',
    language: 'Language',
    notSet: 'Not set',
    
    // Crops & States
    'Wheat': 'Wheat', 'Rice': 'Rice', 'Onion': 'Onion', 'Tomato': 'Tomato', 'Cotton': 'Cotton',
    'Soybean': 'Soybean', 'Potato': 'Potato', 'Maize': 'Maize', 'Sugarcane': 'Sugarcane',
    'Maharashtra': 'Maharashtra', 'Rajasthan': 'Rajasthan', 'Punjab': 'Punjab',
    'Karnataka': 'Karnataka', 'Madhya Pradesh': 'Madhya Pradesh', 'Uttar Pradesh': 'Uttar Pradesh', 'Gujarat': 'Gujarat'
  },
  mr: {
    home: 'मुख्यपृष्ठ (Home)',
    pestTitle: 'AI कीड ओळख',
    pestSubtitle: 'AI द्वारे कीड ओळख — फोटो अपलोड करा',
    uploadTitle: 'पिकाचा फोटो अपलोड करा',
    uploadSub: 'तुमच्या पिकाचा फोटो निवडा',
    dragActive: 'येथे फोटो ड्रॅग करा...',
    dragIdle: 'फोटो ड्रॅग करा किंवा क्लिक करा',
    uploadHint: 'JPG, PNG १०MB पर्यंत',
    cropTypeLabel: 'पिकाचा प्रकार',
    btnDetecting: 'AI तपासणी करत आहे...',
    btnDetect: 'कीड ओळखा',
    resultTitle: 'तपासणीचा निकाल',
    resultSub: 'कीड ओळखीचा निकाल',
    pestLabel: 'आढळलेली कीड',
    confidence: 'खात्री (Confidence)',
    treatmentTitle: 'उपाय/उपचार',
    historyTitle: 'तपासणी इतिहास',
    historySub: 'मागील कीड अहवाल',
    colCrop: 'पीक',
    colPest: 'कीड',
    colConfidence: 'खात्री',
    colLocation: 'ठिकाण',
    colDate: 'तारीख',
    emptyTitle: 'AI तपासणीसाठी तयार',
    emptySub: 'पिकाचा फोटो अपलोड करा आणि कीड ओळखा',
    errorUpload: 'कृपया प्रथम पिकाचा फोटो अपलोड करा.',
    errorDetect: 'तपासणी अयशस्वी. पुन्हा प्रयत्न करा.',
    districtAlert: 'जिल्हा धोक्याची सूचना',
    
    // Other Pages (Weather)
    weatherTitle: 'हवामानावर आधारित कीड अंदाज',
    weatherSubtitle: 'हवामानावर आधारित कीड अंदाज',
    locationCropTitle: 'जिल्हा व पीक निवडा',
    locationCropSub: 'जिल्हा आणि पीक निवडा',
    labelDistrict: 'जिल्हा',
    labelState: 'राज्य',
    labelCrop: 'पीक',
    btnPredicting: 'अंदाज घेत आहोत...',
    btnPredict: 'अंदाज मिळवा',
    humidity: 'आर्द्रता',
    rainfall: 'पाऊस',
    wind: 'वारा',
    riskLevel: 'धोका पातळी',
    advisory: 'सल्ला',
    predictedRisks: 'संभाव्य कीड धोके',
    predictedRisksSub: 'किडीचा धोका',
    why: 'कारण',
    prevention: 'प्रतिबंधक उपाय',
    sprayTime: 'फवारणीची योग्य वेळ',

    // Schemes
    schemesTitle: 'सरकारी योजना',
    schemesSubtitle: 'सरकारी योजना — आपल्यासाठी पात्र योजना पहा',
    btnAllSchemes: 'सर्व योजना',
    btnRecSchemes: 'AI शिफारसी',
    loadingSchemes: 'योजना लोड होत आहेत...',
    aiFinding: 'AI तुमच्यासाठी योग्य योजना शोधत आहे...',
    recommended: 'शिफारस केलेले',
    active: 'सक्रिय',
    aiRecLabel: 'AI शिफारस',
    maxIncome: 'कमाल उत्पन्न',
    maxLand: 'कमाल जमीन',
    acres: 'एकर',
    benefits: 'फायदे',
    applyOnline: 'ऑनलाईन अर्ज करा',
    noSchemes: 'कोणतीही योजना आढळली नाही.',
    noRecs: 'सध्या कोणतीही AI शिफारस उपलब्ध नाही.',

    // SMS Alerts
    alertsTitle: 'माझ्या सूचना',
    alertsSubtitle: 'माझ्या सूचना — कृषिदृष्टी कडून मिळालेल्या सूचना',
    smsActive: 'स्वयंचलित SMS सूचना सक्रिय',
    smsActiveSub: 'कृषिदृष्टी कीड, हवामान आणि भाव बदलासाठी आपोआप SMS पाठवते',
    registered: 'नोंदणीकृत',
    totalAlerts: 'एकूण सूचना',
    pestAlerts: 'कीड सूचना',
    weatherAlerts: 'हवामान सूचना',
    priceAlerts: 'भाव सूचना',
    receivedAlerts: 'मिळालेल्या सूचना',
    receivedAlertsSub: 'प्राप्त माहिती',
    noAlerts: 'अद्याप कोणतीही सूचना नाही',
    willReceive: 'तुम्हाला आपोआप SMS सूचना मिळतील जेव्हा:',
    triggerPest: 'तुमच्या जिल्ह्यात कीड प्रादुर्भाव आढळल्यास',
    triggerWeather: 'हवामान बदलण्याची सूचना असल्यास',
    triggerPrice: 'तुमच्या पिकाच्या भावात मोठा बदल झाल्यास',
    triggerScheme: 'नवीन सरकारी योजना उपलब्ध असल्यास',
    autoSmsNote: 'सूचना आपोआप येतील — काहीही करण्याची गरज नाही',
    alertSettings: 'सूचना सेटिंग्ज',
    alertSettingsSub: 'कोणत्या सूचना मिळवायच्या ते निवडा',
    alertInstruction: 'तुमच्या फोनवर कोणत्या सूचना मिळवायच्या ते निवडा',
    sentTo: 'येथे सूचना पाठवल्या जातील',
    phoneHint: 'प्रोफाइलमध्ये फोन नंबर अपडेट करा',
    howItWorks: 'हे कसे कार्य करते',
    howItWorksSub: 'सूचना प्रणाली कशी कार्य करते',
    step1: 'प्रणाली दररोज हवामान आणि किडींवर लक्ष ठेवते',
    step2: 'तुमच्या जिल्ह्यात धोका आढळल्यास',
    step3: 'तुमच्या फोनवर स्वयंचलित SMS पाठवला जातो',
    step4: 'नुकसान होण्यापूर्वी वेळेवर उपाय करा',
    
    // Profile
    profileTitle: 'माझी प्रोफाइल',
    profileSubtitle: 'माझी माहिती',
    primaryCrop: 'मुख्य पीक',
    farmerDetails: 'शेतकरी माहिती',
    farmerDetailsSub: 'शेतकऱ्याचा तपशील',
    fullName: 'पूर्ण नाव',
    email: 'ईमेल',
    phone: 'फोन',
    state: 'राज्य',
    district: 'जिल्हा',
    village: 'गाव',
    landSize: 'जमीन क्षेत्र',
    annualIncome: 'वार्षिक उत्पन्न',
    category: 'प्रवर्ग',
    language: 'भाषा',
    notSet: 'नोंदणी नाही',

    // Crops & States
    'Wheat': 'गहू (Wheat)', 'Rice': 'भात (Rice)', 'Onion': 'कांदा (Onion)', 'Tomato': 'टोमॅटो (Tomato)', 'Cotton': 'कापूस (Cotton)',
    'Soybean': 'सोयाबीन (Soybean)', 'Potato': 'बटाटा (Potato)', 'Maize': 'मका (Maize)', 'Sugarcane': 'ऊस (Sugarcane)',
    'Maharashtra': 'महाराष्ट्र', 'Rajasthan': 'राजस्थान', 'Punjab': 'पंजाब',
    'Karnataka': 'कर्नाटक', 'Madhya Pradesh': 'मध्य प्रदेश', 'Uttar Pradesh': 'उत्तर प्रदेश', 'Gujarat': 'गुजरात'
  }
};

const t = (key, lang = 'en') => {
  const dictionary = LOCALES[lang] || LOCALES.en;
  return dictionary[key] || key;
};

// ===== PEST DETECTION PAGE =====
export const PestDetection = () => {
  const { user } = useAuth();
  const lang = user?.preferredLanguage || 'en';
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [cropType, setCropType] = useState('Wheat');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    pestAPI.getHistory().then(r => setHistory(r.data || [])).catch(() => { });
  }, []);

  const onDrop = useCallback(files => {
    if (files[0]) {
      setFile(files[0]);
      setPreview(URL.createObjectURL(files[0]));
      setResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxFiles: 1
  });

  const handleDetect = async () => {
    if (!file) { setError(t('errorUpload', lang)); return; }
    setLoading(true); setError(''); setResult(null);
    const fd = new FormData();
    fd.append('image', file);
    fd.append('cropType', cropType);
    try {
      const res = await pestAPI.detect(fd);
      setResult(res.data);
      pestAPI.getHistory().then(r => setHistory(r.data || [])).catch(() => { });
    } catch (err) {
      setError(err.response?.data?.error || t('errorDetect', lang));
    } finally { setLoading(false); }
  };

  const CROPS = ['Wheat', 'Rice', 'Onion', 'Tomato', 'Cotton', 'Soybean', 'Potato', 'Maize', 'Sugarcane'];

  return (
    <div className="fade-in" id="pest-detection-page">
      <div className="km-page-header d-flex justify-content-between align-items-start">
        <div>
          <div className="km-breadcrumb">🏠 {t('home', lang)} <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>{t('pestTitle', lang)}</span></div>
          <h1><i className="fas fa-bug me-2 icon-spin-in" style={{ color: 'var(--red-alert)' }}></i>{t('pestTitle', lang)}</h1>
          <p>{t('pestSubtitle', lang)}</p>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <div className="km-card">
            <div className="km-card-header">
              <div className="km-card-icon red"><i className="fas fa-camera"></i></div>
              <div>
                <h5 style={{ margin: 0 }}>{t('uploadTitle', lang)}</h5>
                <small style={{ color: 'var(--text-light)' }}>{t('uploadSub', lang)}</small>
              </div>
            </div>
            <div {...getRootProps()} className={`km-upload-zone ${isDragActive ? 'active' : ''} mb-3`}>
              <input {...getInputProps()} />
              {preview ? (
                <div>
                  <img src={preview} alt="crop" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
                  <p style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: 'var(--text-light)' }}>{file?.name}</p>
                </div>
              ) : (
                <>
                  <div className="upload-icon">📷</div>
                  <p style={{ fontWeight: 600, marginBottom: 4 }}>{isDragActive ? t('dragActive', lang) : t('dragIdle', lang)}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: 8 }}>{t('uploadHint', lang)}</p>
                </>
              )}
            </div>
            <div className="mb-3">
              <label className="km-label">{t('cropTypeLabel', lang)}</label>
              <select className="km-input" value={cropType} onChange={e => setCropType(e.target.value)}>
                {CROPS.map(c => <option key={c} value={c}>{t(c, lang)}</option>)}
              </select>
            </div>
            {error && <div className="km-alert error mb-3"><i className="fas fa-exclamation-circle me-2"></i>{error}</div>}
            <button className="btn-km-primary w-100 justify-content-center" onClick={handleDetect} disabled={loading || !file}>
              {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>{t('btnDetecting', lang)}</>
                : <><i className="fas fa-microscope"></i>{t('btnDetect', lang)}</>}
            </button>
          </div>
        </div>

        <div className="col-md-6">
          {result ? (
            <div className="km-card fade-in">
              <div className="km-card-header">
                <div className="km-card-icon red"><i className="fas fa-flask"></i></div>
                <div>
                  <h5 style={{ margin: 0 }}>{t('resultTitle', lang)}</h5>
                  <small style={{ color: 'var(--text-light)' }}>{t('resultSub', lang)}</small>
                </div>
              </div>
              <div style={{ background: 'var(--green-mist)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>{t('pestLabel', lang)}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--red-alert)', marginTop: 4 }}>{result.pestName}</div>
                <span style={{ background: 'var(--green-pale)', color: 'var(--green-primary)', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 700 }}>
                  {result.confidencePercent?.toFixed(1)}% {t('confidence', lang)}
                </span>
              </div>
              {result.districtAlert && (
                <div className="km-alert warning mb-3">
                  <i className="fas fa-exclamation-triangle me-2"></i><strong>{t('districtAlert', lang)}:</strong> {result.districtAlert}
                </div>
              )}
              <div style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.875rem' }}>
                <i className="fas fa-prescription-bottle-medical me-2" style={{ color: 'var(--green-primary)' }}></i>{t('treatmentTitle', lang)}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-mid)', background: 'var(--green-mist)', padding: '1rem', borderRadius: 'var(--radius-sm)', lineHeight: 1.7 }}>
                {result.treatmentRecommendation}
              </p>
            </div>
          ) : (
            <div className="km-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div className="km-empty-state">
                <div className="empty-icon">🔬</div>
                <h5>{t('emptyTitle', lang)}</h5>
                <p>{t('emptySub', lang)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="km-card mt-4">
          <div className="km-card-header">
            <div className="km-card-icon earth"><i className="fas fa-history"></i></div>
            <div><h5 style={{ margin: 0 }}>{t('historyTitle', lang)}</h5>
              <small style={{ color: 'var(--text-light)' }}>{t('historySub', lang)}</small></div>
          </div>
          <div className="table-responsive">
            <table className="km-table">
              <thead><tr><th>{t('colCrop', lang)}</th><th>{t('colPest', lang)}</th><th>{t('colConfidence', lang)}</th><th>{t('colLocation', lang)}</th><th>{t('colDate', lang)}</th></tr></thead>
              <tbody>
                {history.slice(0, 10).map(h => (
                  <tr key={h.id}>
                    <td><span style={{ background: 'var(--green-pale)', color: 'var(--green-primary)', padding: '3px 10px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 600 }}>{t(h.cropType, lang)}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--red-alert)' }}>{h.pestName}</td>
                    <td style={{ color: 'var(--green-primary)', fontWeight: 700 }}>{h.confidencePercent?.toFixed(1)}%</td>
                    <td style={{ color: 'var(--text-light)' }}>{h.district}, {t(h.state, lang)}</td>
                    <td style={{ color: 'var(--text-light)', fontSize: '0.82rem' }}>{new Date(h.reportedAt).toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


// ===== WEATHER PEST PREDICTION PAGE =====
export const WeatherPestPrediction = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ district: user?.district || '', state: user?.state || 'Maharashtra', cropType: user?.primaryCrop || 'Wheat' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePredict = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setData(null);
    try {
      const res = await weatherAPI.predict(form.district, form.state, form.cropType);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Try again.');
    } finally { setLoading(false); }
  };

  const riskBadge = r => <span className={`badge-risk-${r?.toLowerCase() || 'low'}`}>{r}</span>;

  return (
    <div className="fade-in">
      <div className="km-page-header">
        <div className="km-breadcrumb">🏠 Home <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>Weather Alerts</span></div>
        <h1><i className="fas fa-cloud-sun-rain me-2 icon-spin-in" style={{ color: 'var(--sky)' }}></i>Weather-Based Pest Prediction</h1>
        <p className="marathi">हवामानावर आधारित कीड अंदाज</p>
      </div>

      <div className="km-card mb-4">
        <div className="km-card-header">
          <div className="km-card-icon sky"><i className="fas fa-map-marker-alt"></i></div>
          <div><h5 style={{ margin: 0 }}>Select Location & Crop</h5>
            <small className="marathi" style={{ color: 'var(--text-light)' }}>जिल्हा व पीक निवडा</small></div>
        </div>
        <form onSubmit={handlePredict}>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="km-label">District / जिल्हा</label>
              <input className="km-input" placeholder="e.g. Nashik" value={form.district} onChange={e => set('district', e.target.value)} required />
            </div>
            <div className="col-md-4">
              <label className="km-label">State / राज्य</label>
              <select className="km-input" value={form.state} onChange={e => set('state', e.target.value)}>
                {['Maharashtra', 'Rajasthan', 'Punjab', 'Karnataka', 'Madhya Pradesh', 'Uttar Pradesh', 'Gujarat'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="km-label">Crop Type / पीक</label>
              <select className="km-input" value={form.cropType} onChange={e => set('cropType', e.target.value)}>
                {['Wheat', 'Rice', 'Onion', 'Tomato', 'Cotton', 'Soybean', 'Potato', 'Maize'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-km-primary mt-3" disabled={loading}>
            {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Analyzing...</>
              : <><i className="fas fa-cloud-sun-rain"></i>Predict Pests / अंदाज मिळवा</>}
          </button>
        </form>
      </div>

      {error && <div className="km-alert error">{error}</div>}

      {data && (
        <div className="fade-in">
          <div className="km-weather-card mb-4">
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <p style={{ opacity: 0.7, fontSize: '0.82rem', marginBottom: 4 }}>{data.district}, {data.state}</p>
                <h2 style={{ color: 'white', fontWeight: 800, fontSize: '2.5rem', margin: 0 }}>{data.temperature?.toFixed(1)}°C</h2>
                <p style={{ margin: '4px 0 0', opacity: 0.8 }}>{data.weatherCondition}</p>
                <p className="marathi" style={{ opacity: 0.6, fontSize: '0.8rem' }}>{data.season}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { icon: '💧', label: 'Humidity', value: `${data.humidity?.toFixed(0)}%` },
                  { icon: '🌧️', label: 'Rainfall', value: `${data.rainfall?.toFixed(1)}mm` },
                  { icon: '💨', label: 'Wind', value: `${data.windSpeed?.toFixed(1)}km/h` },
                  { icon: '⚠️', label: 'Risk Level', value: data.overallRiskLevel },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', textAlign: 'center' }}>
                    <div>{s.icon}</div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{s.label}</div>
                    <div style={{ fontWeight: 700 }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="km-alert warning mb-4">
            <i className="fas fa-lightbulb me-2"></i>
            <div><strong>Advisory:</strong> {data.generalAdvice}</div>
          </div>

          <div className="km-card">
            <div className="km-card-header">
              <div className="km-card-icon red"><i className="fas fa-bug"></i></div>
              <div><h5 style={{ margin: 0 }}>Predicted Pest Risks</h5>
                <small className="marathi" style={{ color: 'var(--text-light)' }}>संभाव्य कीड धोके</small></div>
            </div>
            <div className="row g-3">
              {data.predictions?.map((p, i) => (
                <div className="col-md-6" key={i}>
                  <div style={{
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '1.25rem',
                    borderLeft: `4px solid ${p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL' ? 'var(--red-alert)' : p.riskLevel === 'MEDIUM' ? 'var(--gold)' : 'var(--green-primary)'}`
                  }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 style={{ margin: 0, fontWeight: 700 }}>{p.pestName}</h6>
                      {riskBadge(p.riskLevel)}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--sky)', fontWeight: 600, marginBottom: 8 }}><i className="fas fa-seedling me-1"></i>{p.cropAffected}</div>
                    <p style={{ fontSize: '0.82rem', marginBottom: 8 }}><strong>Why:</strong> {p.reason}</p>
                    <p style={{ fontSize: '0.82rem', color: 'var(--green-primary)', marginBottom: 4 }}><i className="fas fa-shield-halved me-1"></i><strong>Prevention:</strong> {p.preventiveMeasure}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-light)', margin: 0 }}><i className="fas fa-clock me-1"></i>Best spray time: {p.bestTimeToSpray}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ===== GOVERNMENT SCHEMES PAGE =====
export const GovernmentSchemes = () => {
  const [schemes, setSchemes] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    schemeAPI.getAll().then(r => setSchemes(r.data || [])).catch(() => { }).finally(() => setLoading(false));
    // Eagerly fetch AI recommendations count
    schemeAPI.getRecommendations().then(r => setRecs(r.data || [])).catch(() => { });
  }, []);

  const loadRecs = async () => {
    setTab('recs'); setRecLoading(true);
    try { const r = await schemeAPI.getRecommendations(); setRecs(r.data || []); }
    catch (e) { console.error(e); }
    finally { setRecLoading(false); }
  };

  const SchemeCard = ({ s, isRec }) => (
    <div className="km-card mb-3" style={{ borderLeft: isRec ? '4px solid var(--gold)' : '4px solid var(--green-primary)' }}>
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
        <h5 style={{ fontWeight: 700, margin: 0 }}>{s.name}</h5>
        <div className="d-flex gap-2">
          {isRec && <span style={{ background: 'var(--gold)', color: 'var(--green-dark)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>⭐ Recommended</span>}
          <span style={{ background: 'var(--green-pale)', color: 'var(--green-primary)', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>Active</span>
        </div>
      </div>
      <p style={{ color: 'var(--text-mid)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{s.description}</p>
      {isRec && s.aiReasoning && (
        <div className="km-alert info mb-3" style={{ fontSize: '0.82rem' }}>
          <i className="fas fa-robot me-2"></i><strong>AI Recommendation:</strong> {s.aiReasoning}
        </div>
      )}
      <div className="d-flex flex-wrap gap-2 mb-2" style={{ fontSize: '0.8rem' }}>
        <span style={{ color: 'var(--text-light)' }}><i className="fas fa-indian-rupee-sign me-1"></i>Max Income: ₹{s.maxAnnualIncome?.toLocaleString()}</span>
        <span style={{ color: 'var(--text-light)' }}>• <i className="fas fa-ruler-combined me-1"></i>Max Land: {s.maxLandSizeAcres} acres</span>
        <span style={{ color: 'var(--text-light)' }}>• <i className="fas fa-users me-1"></i>{s.eligibleCategories}</span>
      </div>
      <div style={{ background: 'var(--green-mist)', borderRadius: 6, padding: '0.6rem 1rem', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
        <strong>Benefits:</strong> {s.benefits}
      </div>
      {s.applicationUrl && (
        <a href={s.applicationUrl} target="_blank" rel="noreferrer" className="btn-km-secondary" style={{ fontSize: '0.82rem' }}>
          <i className="fas fa-external-link-alt"></i>Apply Online
        </a>
      )}
    </div>
  );

  return (
    <div className="fade-in" id="gov-schemes-page">
      <div className="km-page-header d-flex justify-content-between align-items-start">
        <div>
          <div className="km-breadcrumb">🏠 Home <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>Government Schemes</span></div>
          <h1><i className="fas fa-file-invoice me-2 icon-spin-in" style={{ color: 'var(--green-primary)' }}></i>Government Schemes</h1>
          <p className="marathi">सरकारी योजना — आपल्यासाठी पात्र योजना पहा</p>
        </div>
      </div>
      <div className="d-flex gap-2 mb-4">
        <button onClick={() => setTab('all')} className={tab === 'all' ? 'btn-km-primary' : 'btn-km-secondary'}>
          <i className="fas fa-list"></i>All Schemes ({schemes.length})
        </button>
        <button onClick={loadRecs} className={tab === 'recs' ? 'btn-km-primary' : 'btn-km-secondary'}>
          <i className="fas fa-star"></i>AI Recommendations ({recs.length})
        </button>
      </div>
      {loading && <div className="km-loading-overlay"><div className="km-spinner"></div><p>Loading schemes...</p></div>}
      {tab === 'all' && !loading && (
        schemes.length > 0 ? schemes.map(s => <SchemeCard key={s.id} s={s} isRec={false} />)
          : <div className="km-empty-state"><div className="empty-icon">📋</div><p>No schemes found. Add schemes to database.</p></div>
      )}
      {tab === 'recs' && (
        recLoading ? <div className="km-loading-overlay"><div className="km-spinner"></div><p className="marathi">AI योजना शोधत आहे...</p></div>
          : recs.length > 0 ? recs.map((s, i) => <SchemeCard key={i} s={s} isRec={true} />)
            : <div className="km-empty-state"><div className="empty-icon">🤖</div><p>No AI recommendations available right now.</p></div>
      )}
    </div>
  );
};


// ===== SMS ALERTS PAGE — FARMER RECEIVES ALERTS =====
export const SmsAlerts = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState({
    PEST_OUTBREAK: true,
    WEATHER_ALERT: true,
    PRICE_ALERT: true,
    SCHEME_REMINDER: false,
  });

  useEffect(() => {
    smsAPI.getHistory()
      .then(r => setHistory(r.data || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const alertTypeConfig = {
    PEST_OUTBREAK: { icon: '🐛', label: 'Pest Outbreak', labelMr: 'कीड उद्रेक', color: '#c0392b', bg: '#fdecea' },
    WEATHER_ALERT: { icon: '🌦️', label: 'Weather Alert', labelMr: 'हवामान सूचना', color: '#1565a8', bg: '#e3f4f6' },
    PRICE_ALERT: { icon: '📈', label: 'Price Alert', labelMr: 'भाव सूचना', color: '#e8a820', bg: '#fef9e7' },
    SCHEME_REMINDER: { icon: '📋', label: 'Scheme Reminder', labelMr: 'योजना आठवण', color: '#1a6b2f', bg: '#e8f5ec' },
    CROP_ADVISORY: { icon: '🌾', label: 'Crop Advisory', labelMr: 'पीक सल्ला', color: '#6b4c2a', bg: '#f5ede6' },
  };

  const getConfig = type => alertTypeConfig[type] || { icon: '🔔', label: type, labelMr: '', color: '#666', bg: '#f5f5f5' };

  const stats = {
    total: history.length,
    pest: history.filter(h => h.alertType === 'PEST_OUTBREAK').length,
    weather: history.filter(h => h.alertType === 'WEATHER_ALERT').length,
    price: history.filter(h => h.alertType === 'PRICE_ALERT').length,
  };

  return (
    <div className="fade-in" id="sms-alerts-page">
      <div className="km-page-header d-flex justify-content-between align-items-start">
        <div>
          <div className="km-breadcrumb">🏠 Home <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>My Alerts</span></div>
          <h1><i className="fas fa-bell me-2 icon-spin-in" style={{ color: 'var(--gold)' }}></i>My Alert Inbox</h1>
          <p className="marathi">माझ्या सूचना — KrishiDrishti कडून मिळालेल्या सूचना</p>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-dark), var(--green-primary))',
        borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem',
        marginBottom: '1.5rem', color: 'white', display: 'flex',
        alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
      }}>
        <div style={{ fontSize: '2.5rem' }}>📱</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '1rem' }}>Automatic SMS Alerts Active</div>
          <div className="marathi" style={{ opacity: 0.8, fontSize: '0.85rem' }}>
            KrishiDrishti आपोआप SMS पाठवते — कीड, हवामान, आणि भाव बदलाच्या वेळी
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: '6px 16px', fontSize: '0.82rem', fontWeight: 600 }}>
          <i className="fas fa-check-circle me-1" style={{ color: '#4db86a' }}></i>
          Registered: {user?.phone || 'Add phone in profile'}
        </div>
      </div>

      {/* Stats */}
      <div className="km-stats-grid">
        {[
          { label: 'Total Alerts', labelMr: 'एकूण सूचना', value: stats.total, icon: '🔔', color: 'green' },
          { label: 'Pest Alerts', labelMr: 'कीड सूचना', value: stats.pest, icon: '🐛', color: 'red' },
          { label: 'Weather Alerts', labelMr: 'हवामान सूचना', value: stats.weather, icon: '🌦️', color: 'sky' },
          { label: 'Price Alerts', labelMr: 'भाव सूचना', value: stats.price, icon: '📈', color: 'gold' },
        ].map((s, i) => (
          <div className="stagger-enter" key={i}>
            <div className={`km-stat-card ${s.color}`}>
              <div className="stat-label">{s.label}<br /><span className="marathi" style={{ fontSize: '0.7rem' }}>{s.labelMr}</span></div>
              <div className="stat-value mt-1" style={{
                color: s.color === 'red' ? 'var(--red-alert)' : s.color === 'gold' ? 'var(--gold)' : s.color === 'sky' ? 'var(--sky)' : 'var(--green-primary)'
              }}>{s.value}</div>
              <span style={{ fontSize: '2rem', position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.15 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Alert History */}
        <div className="col-md-8">
          <div className="km-card">
            <div className="km-card-header">
              <div className="km-card-icon gold"><i className="fas fa-inbox"></i></div>
              <div>
                <h5 style={{ margin: 0 }}>Received Alerts</h5>
                <small className="marathi" style={{ color: 'var(--text-light)' }}>मिळालेल्या सूचना</small>
              </div>
            </div>

            {loading ? (
              <div className="km-loading-overlay"><div className="km-spinner"></div></div>
            ) : history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map(h => {
                  const cfg = getConfig(h.alertType);
                  return (
                    <div key={h.alertId} style={{
                      background: cfg.bg, borderRadius: 'var(--radius-sm)',
                      padding: '1rem', border: `1px solid ${cfg.color}22`,
                      borderLeft: `4px solid ${cfg.color}`,
                      display: 'flex', gap: 12, alignItems: 'flex-start'
                    }}>
                      <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{cfg.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem', color: cfg.color }}>{cfg.label}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {h.sentAt ? new Date(h.sentAt).toLocaleString('en-IN') : '-'}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-dark)', lineHeight: 1.6 }}>{h.message}</p>
                      </div>
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap',
                        background: h.status === 'SENT' ? '#d4edda' : '#fdecea',
                        color: h.status === 'SENT' ? '#155724' : '#721c24'
                      }}>{h.status}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="km-empty-state">
                <div className="empty-icon">📭</div>
                <h5>No alerts yet</h5>
                <p>You will receive SMS alerts automatically when:</p>
                <div style={{ textAlign: 'left', display: 'inline-block', marginTop: 8 }}>
                  {[
                    '🐛 A pest outbreak is detected in your district',
                    '🌦️ Extreme weather is forecasted',
                    '📈 Your crop price changes significantly',
                    '📋 A new government scheme is available',
                  ].map((t, i) => (
                    <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-mid)', padding: '4px 0' }}>{t}</div>
                  ))}
                </div>
                <p className="marathi mt-3" style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                  सूचना आपोआप येतील — काहीही करण्याची गरज नाही
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Settings */}
        <div className="col-md-4">
          <div className="km-card">
            <div className="km-card-header">
              <div className="km-card-icon green"><i className="fas fa-sliders"></i></div>
              <div>
                <h5 style={{ margin: 0 }}>Alert Settings</h5>
                <small className="marathi" style={{ color: 'var(--text-light)' }}>सूचना सेटिंग्ज</small>
              </div>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginBottom: '1rem' }}>
              Choose which alerts you want to receive on your phone
              <span className="marathi d-block" style={{ marginTop: 2 }}>कोणत्या सूचना मिळवायच्या ते निवडा</span>
            </p>

            {Object.entries(subscriptions).map(([key, val]) => {
              const cfg = getConfig(key);
              return (
                <div key={key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.75rem', marginBottom: 8, borderRadius: 'var(--radius-sm)',
                  background: val ? cfg.bg : 'var(--green-mist)',
                  border: `1px solid ${val ? cfg.color + '33' : 'var(--border)'}`,
                  cursor: 'pointer', transition: 'var(--transition)'
                }} onClick={() => setSubscriptions(s => ({ ...s, [key]: !val }))}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '1.25rem' }}>{cfg.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{cfg.label}</div>
                      <div className="marathi" style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{cfg.labelMr}</div>
                    </div>
                  </div>
                  <div style={{
                    width: 42, height: 24, borderRadius: 12, position: 'relative', cursor: 'pointer',
                    background: val ? 'var(--green-primary)' : '#ccc', transition: 'var(--transition)'
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', background: 'white',
                      position: 'absolute', top: 3, left: val ? 21 : 3, transition: 'var(--transition)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                    }}></div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: '1rem', padding: '0.875rem', background: 'var(--green-mist)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
              <i className="fas fa-info-circle me-2" style={{ color: 'var(--green-primary)' }}></i>
              Alerts sent to: <strong>{user?.phone || 'No phone set'}</strong>
              <div className="marathi" style={{ marginTop: 4, color: 'var(--text-light)', fontSize: '0.75rem' }}>
                फोन नंबर प्रोफाइलमध्ये अपडेट करा
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="km-card mt-3">
            <div className="km-card-header">
              <div className="km-card-icon sky"><i className="fas fa-circle-info"></i></div>
              <div><h5 style={{ margin: 0 }}>How It Works</h5>
                <small className="marathi" style={{ color: 'var(--text-light)' }}>कसे काम करते</small></div>
            </div>
            {[
              { step: '1', text: 'System monitors weather & pests daily', mr: 'दररोज हवामान व कीड तपासणी' },
              { step: '2', text: 'Risk detected in your district', mr: 'जिल्ह्यात धोका आढळल्यास' },
              { step: '3', text: 'Automatic SMS sent to your phone', mr: 'आपोआप SMS येतो' },
              { step: '4', text: 'Take action before damage occurs', mr: 'वेळेत उपाय करा' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', minWidth: 26,
                  background: 'var(--green-primary)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700
                }}>{s.step}</div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.text}</div>
                  <div className="marathi" style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{s.mr}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};


// ===== PROFILE PAGE =====
export const ProfilePage = () => {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState(localStorage.getItem('km_avatar') || '');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem('km_avatar', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fade-in">
      <div className="km-page-header">
        <div className="km-breadcrumb">🏠 Home <i className="fas fa-chevron-right" style={{ fontSize: 8 }}></i> <span>Profile</span></div>
        <h1><i className="fas fa-user-circle me-2 icon-spin-in" style={{ color: 'var(--green-primary)' }}></i>My Profile</h1>
        <p className="marathi">माझी माहिती</p>
      </div>
      <div className="row g-4">
        <div className="col-md-4">
          <div className="km-card text-center stagger-enter">
            <div className="profile-avatar-container" onClick={() => document.getElementById('avatar-input').click()}>
              {avatar ? (
                <img src={avatar} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="profile-avatar" style={{
                  background: 'linear-gradient(135deg,var(--green-primary),var(--green-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '2.5rem', color: 'white'
                }}>👨‍🌾</div>
              )}
              <div className="profile-avatar-overlay">
                <i className="fas fa-camera"></i>
              </div>
              <input type="file" id="avatar-input" className="profile-avatar-input"
                accept="image/*" onChange={handleAvatarChange} />
            </div>
            <h4 style={{ fontWeight: 800 }}>{user?.fullName || 'Farmer'}</h4>
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>{user?.email}</p>
            <span style={{ background: 'var(--green-pale)', color: 'var(--green-primary)', padding: '5px 16px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 700 }}>{user?.role || 'FARMER'}</span>
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--green-mist)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>Primary Crop / मुख्य पीक</div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--green-primary)' }}>{user?.primaryCrop}</div>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="km-card">
            <div className="km-card-header">
              <div className="km-card-icon green"><i className="fas fa-id-card"></i></div>
              <div><h5 style={{ margin: 0 }}>Farmer Details</h5><small className="marathi" style={{ color: 'var(--text-light)' }}>शेतकरी माहिती</small></div>
            </div>
            <div className="row g-0">
              {[
                { icon: '👤', label: 'Full Name / नाव', value: user?.fullName },
                { icon: '📧', label: 'Email', value: user?.email },
                { icon: '📞', label: 'Phone / फोन', value: user?.phone || 'Not set' },
                { icon: '🏛️', label: 'State / राज्य', value: user?.state },
                { icon: '📍', label: 'District / जिल्हा', value: user?.district },
                { icon: '🏘️', label: 'Village / गाव', value: user?.village || 'Not set' },
                { icon: '🌾', label: 'Primary Crop / मुख्य पीक', value: user?.primaryCrop },
                { icon: '📐', label: 'Land Size / जमीन', value: `${user?.landSizeAcres} Acres` },
                { icon: '💰', label: 'Annual Income / उत्पन्न', value: `₹${user?.annualIncome?.toLocaleString()}` },
                { icon: '🏷️', label: 'Category / प्रवर्ग', value: user?.category },
                { icon: '🌐', label: 'Language / भाषा', value: user?.preferredLanguage === 'mr' ? 'मराठी' : 'English' },
              ].map((f, i) => (
                <div className="col-md-6" key={i}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.value || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};