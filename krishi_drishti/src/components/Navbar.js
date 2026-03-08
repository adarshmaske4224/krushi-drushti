import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/dashboard',   icon: 'fa-gauge-high',     label: 'Dashboard',       labelMr: 'डॅशबोर्ड' },
    { to: '/prices',      icon: 'fa-indian-rupee-sign', label: 'Crop Prices',   labelMr: 'पीक भाव' },
    { to: '/pest',        icon: 'fa-bug',             label: 'Pest Detection',  labelMr: 'कीड ओळख' },
    { to: '/weather',     icon: 'fa-cloud-sun-rain',  label: 'Weather Alerts',  labelMr: 'हवामान' },
    { to: '/schemes',     icon: 'fa-file-invoice',    label: 'Gov. Schemes',    labelMr: 'सरकारी योजना' },
    { to: '/sms',         icon: 'fa-bell',            label: 'My Alerts',       labelMr: 'माझ्या सूचना' },
    { to: '/profile',     icon: 'fa-user-circle',     label: 'My Profile',      labelMr: 'माझी माहिती' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="km-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Main Menu</div>
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`sidebar-link ${location.pathname === l.to ? 'active' : ''}`}>
            <i className={`fas ${l.icon}`}></i>
            <span>{l.label}<br/><small className="marathi" style={{fontSize:'0.7rem',opacity:0.7}}>{l.labelMr}</small></span>
          </Link>
        ))}
      </div>

      <div className="sidebar-section" style={{marginTop:'auto'}}>
        <div className="sidebar-label">Account</div>
        <div className="sidebar-link" style={{cursor:'default'}}>
          <i className="fas fa-user-circle" style={{color:'var(--gold)'}}></i>
          <div>
            <div style={{fontSize:'0.85rem',color:'white',fontWeight:600}}>{user?.fullName || 'Farmer'}</div>
            <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)'}}>{user?.district}, {user?.state}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-100 border-0 text-start"
          style={{background:'rgba(192,57,43,0.15)',color:'#e74c3c', marginTop:'8px'}}>
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout / बाहेर पडा</span>
        </button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  return (
    <nav className="km-navbar navbar">
      <div className="container-fluid px-4">
        <span className="navbar-brand">
          <span className="logo-icon">🌾</span>
          KrishiDrishti
          <small className="marathi ms-2" style={{fontSize:'0.9rem',opacity:0.7,fontWeight:400}}>कृषी दृष्टी</small>
        </span>
        <div className="d-flex align-items-center gap-3">
          <span style={{color:'rgba(255,255,255,0.6)',fontSize:'0.8rem'}}>
            <i className="fas fa-circle" style={{color:'#4db86a',fontSize:'0.5rem',marginRight:'6px'}}></i>
            System Online
          </span>
        </div>
      </div>
    </nav>
  );
};

export { Navbar, Sidebar };