import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, KeyRound, User, Lock, ArrowRight, LogOut } from 'lucide-react';
import './LoginDrawer.css';

export default function LoginDrawer({ isOpen, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Default credentials
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = '26abo@365';

  useEffect(() => {
    const session = sessionStorage.getItem('admin_logged_in');
    setIsLoggedIn(session === 'true');
  }, [isOpen]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_logged_in', 'true');
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
      onClose();
      navigate('/admin');
    } else {
      alert('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    setIsLoggedIn(false);
    onClose();
    navigate('/');
  };

  const handleGoToDashboard = () => {
    onClose();
    navigate('/admin');
  };

  return (
    <>
      <div 
        className={`login-drawer-overlay ${isOpen ? 'open' : ''}`} 
        onClick={onClose} 
      />
      <div className={`login-drawer-container glass-panel ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="login-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <KeyRound size={20} className="login-header-icon" />
            <h2 className="login-drawer-title">Admin Access</h2>
          </div>
          <button className="login-drawer-close-btn" onClick={onClose} aria-label="Close panel">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="login-drawer-content">
          {isLoggedIn ? (
            <div className="login-success-state">
              <div className="avatar-shield">
                <User size={36} />
              </div>
              <h3>Active Session</h3>
              <p>You are authenticated as the administrator.</p>
              
              <div className="logged-in-actions">
                <button className="drawer-login-btn primary" onClick={handleGoToDashboard}>
                  <span>Go to Dashboard</span>
                  <ArrowRight size={16} />
                </button>
                <button className="drawer-login-btn secondary" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="login-drawer-form">
              <p className="login-form-subtitle">Enter credentials to unlock inventories, bookkeeping, and invoicing tools.</p>
              
              <div className="login-drawer-field">
                <label>Username</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    required 
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-drawer-field">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock size={16} className="input-icon" />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="drawer-login-btn primary">
                <span>Unlock Dashboard</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
