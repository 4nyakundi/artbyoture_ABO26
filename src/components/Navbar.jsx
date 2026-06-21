import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ cartCount, onCartToggle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Check if we are on the Lutoni shop section
  const isLutoni = location.pathname.startsWith('/shop');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className={`navbar glass-header ${scrolled ? 'scrolled' : ''} ${isLutoni ? 'lutoni-nav' : ''}`}>
      <NavLink to="/" className="navbar-logo-container">
        <img 
          src={isLutoni ? '/assets/lutoni_logo.png' : '/assets/artbyoture_logo.png'} 
          alt={isLutoni ? 'Lutoni Logo' : 'Art By Oture Logo'} 
          className="navbar-logo" 
        />
        <span className="navbar-brand-name">
          {isLutoni ? 'Lutoni' : 'Art By Oture'}
        </span>
      </NavLink>

      <nav>
        <ul className={`navbar-menu ${isOpen ? 'open' : ''}`}>
          <li className="navbar-item">
            <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
              Home
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/gallery" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Gallery
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/shop" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Lutoni Shop
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/videos" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Videos
            </NavLink>
          </li>
          <li className="navbar-item">
            <NavLink to="/admin" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
          </li>
        </ul>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button className="cart-toggle-btn" onClick={onCartToggle}>
          <ShoppingBag size={18} />
          <span>Cart</span>
          <span className="cart-count">{cartCount}</span>
        </button>

        <button 
          className="burger-menu-btn" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </header>
  );
}
