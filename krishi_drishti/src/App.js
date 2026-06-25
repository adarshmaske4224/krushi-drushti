import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, Sidebar } from './components/Navbar';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import CropPrices from './pages/CropPrices';
import { PestDetection, WeatherPestPrediction, GovernmentSchemes, SmsAlerts, ProfilePage } from './pages/OtherPages';
import { AIDoctor } from './pages/AIDoctor';
import CropRecommendation from './pages/CropRecommendation';

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--green-mist)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌾</div>
        <div className="km-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-light)', fontFamily: 'var(--font-marathi)' }}>लोड होत आहे...</p>
      </div>
    </div>
  );
  return isLoggedIn ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />
      <div style={{ display: 'flex' }}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="km-main">{children}</main>
      </div>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/ai-doctor" element={<ProtectedRoute><AppLayout><AIDoctor /></AppLayout></ProtectedRoute>} />
          <Route path="/prices" element={<ProtectedRoute><AppLayout><CropPrices /></AppLayout></ProtectedRoute>} />
          <Route path="/pest" element={<ProtectedRoute><AppLayout><PestDetection /></AppLayout></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><AppLayout><WeatherPestPrediction /></AppLayout></ProtectedRoute>} />
          <Route path="/schemes" element={<ProtectedRoute><AppLayout><GovernmentSchemes /></AppLayout></ProtectedRoute>} />
          <Route path="/sms" element={<ProtectedRoute><AppLayout><SmsAlerts /></AppLayout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
          <Route path="/crop-recommend" element={<ProtectedRoute><AppLayout><CropRecommendation /></AppLayout></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;