import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const sliderRef = useRef(null);
  const trackRef = useRef(null);
  const marqueeRef = useRef(null);
  const infoHeaderRef = useRef(null);

  // Core showcase items
  const showcaseItems = [
    {
      title: 'Neo Action',
      year: '2026',
      cat: 'Acrylic Painting',
      img: '/assets/7BE81036-261E-4BFB-ADD4-781D9F76BF5F.JPG',
      link: '/gallery'
    },
    {
      title: 'Thorned',
      year: '2025',
      cat: 'Oil Painting',
      img: '/assets/7D43C050-0C75-49E7-860E-415290BA16EF.jpg',
      link: '/gallery'
    },
    {
      title: 'Pure Motion',
      year: '2025',
      cat: 'Abstract Art',
      img: '/assets/BCB72D95-50CC-4213-9FE9-6C4141604DAF.JPG',
      link: '/gallery'
    },
    {
      title: 'Cubism Dream',
      year: '2026',
      cat: 'Picasso Tribute',
      img: '/assets/IMG_0559.jpg',
      link: '/gallery'
    },
    {
      title: 'Lutoni Garment',
      year: '2026',
      cat: 'Signature Tee',
      img: '/assets/lutoni_logo.png',
      link: '/shop'
    }
  ];

  useEffect(() => {
    // 1. Horizontal Scroll / Drag effect using GSAP
    const track = trackRef.current;
    if (track) {
      let isDragging = false;
      let startX = 0;
      let scrollLeft = 0;
      let xVelocity = 0;
      let lastX = 0;
      let animationFrameId = null;

      const handleMouseDown = (e) => {
        isDragging = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft || 0;
        lastX = e.pageX;
        track.style.cursor = 'grabbing';
      };

      const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5; // scroll-speed
        track.scrollLeft = scrollLeft - walk;

        // Calculate velocity
        xVelocity = e.pageX - lastX;
        lastX = e.pageX;
      };

      const handleMouseUpOrLeave = () => {
        isDragging = false;
        track.style.cursor = 'grab';
        
        // Inertia scrolling
        const applyInertia = () => {
          if (Math.abs(xVelocity) > 0.5) {
            track.scrollLeft -= xVelocity;
            xVelocity *= 0.92; // friction
            animationFrameId = requestAnimationFrame(applyInertia);
          }
        };
        applyInertia();
      };

      track.addEventListener('mousedown', handleMouseDown);
      track.addEventListener('mousemove', handleMouseMove);
      track.addEventListener('mouseup', handleMouseUpOrLeave);
      track.addEventListener('mouseleave', handleMouseUpOrLeave);

      // Mobile touch events
      const handleTouchStart = (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft || 0;
        lastX = e.touches[0].pageX;
      };

      const handleTouchMove = (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
        xVelocity = e.touches[0].pageX - lastX;
        lastX = e.touches[0].pageX;
      };

      const handleTouchEnd = () => {
        isDragging = false;
        const applyInertia = () => {
          if (Math.abs(xVelocity) > 0.5) {
            track.scrollLeft -= xVelocity;
            xVelocity *= 0.92;
            animationFrameId = requestAnimationFrame(applyInertia);
          }
        };
        applyInertia();
      };

      track.addEventListener('touchstart', handleTouchStart);
      track.addEventListener('touchmove', handleTouchMove);
      track.addEventListener('touchend', handleTouchEnd);

      return () => {
        cancelAnimationFrame(animationFrameId);
        track.removeEventListener('mousedown', handleMouseDown);
        track.removeEventListener('mousemove', handleMouseMove);
        track.removeEventListener('mouseup', handleMouseUpOrLeave);
        track.removeEventListener('mouseleave', handleMouseUpOrLeave);
        track.removeEventListener('touchstart', handleTouchStart);
        track.removeEventListener('touchmove', handleTouchMove);
        track.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, []);

  useEffect(() => {
    // 2. GSAP Scroll Trigger for Info Header
    if (infoHeaderRef.current) {
      gsap.fromTo(infoHeaderRef.current, 
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          scrollTrigger: {
            trigger: infoHeaderRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }
  }, []);

  return (
    <div className="home-container">
      {/* Hero Showcase Drag Slider */}
      <section className="hero-slider-section" ref={sliderRef}>
        <div 
          className="slider-track drag-interactive" 
          ref={trackRef}
          style={{ cursor: 'grab', overflowX: 'hidden' }}
        >
          {showcaseItems.map((item, index) => (
            <Link to={item.link} key={index} className="slide-item">
              <div className="slide-media-wrapper">
                <img src={item.img} alt={item.title} className="slide-img" />
                <div className="slide-caption">
                  <span className="slide-title">{item.title}</span>
                  <div className="slide-meta">
                    <span>{item.cat}</span>
                    <span>{item.year}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="slider-instructions">Drag to Explore</div>
      </section>

      {/* Marquee Section */}
      <section className="marquee-section" ref={marqueeRef}>
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-text">Art By Oture</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Lutoni Wearables</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text">Edgy Design</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Authentic Craft</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            {/* Duplicate for infinite loop */}
            <span className="marquee-text">Art By Oture</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Lutoni Wearables</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text">Edgy Design</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Authentic Craft</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="info-section">
        <div className="container">
          <div className="info-grid">
            <div className="info-header" ref={infoHeaderRef}>
              A portal into <br />
              visual emotion <br />
              & garments.
            </div>

            <div className="info-text-wrapper">
              <p className="info-desc">
                Art By Oture is an expressive painter crafting deep textures, cubist shapes, and organic contrast. Every piece represents a journey beyond pure illustration.
              </p>
              <p className="info-desc">
                In addition, Lutoni Wearables offers high-concept garments, street garments, and accessories designed with structural patterns directly inspired by the art.
              </p>
              
              <div className="brand-showcase-buttons">
                <Link to="/gallery" className="brand-btn oture">
                  Paintings Gallery <ArrowRight size={16} style={{ marginLeft: '10px' }} />
                </Link>
                <Link to="/shop" className="brand-btn lutoni">
                  Lutoni Shop <ArrowRight size={16} style={{ marginLeft: '10px' }} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo-title">Oture • Lutoni</div>
              <p style={{ marginTop: '20px', opacity: 0.7, maxWidth: '350px', lineHeight: '1.6' }}>
                Expressive painting meets streetwear garments. An organic collaboration of textures, zebra wave motifs, and high-end visual design.
              </p>
            </div>

            <div>
              <h4 className="footer-column-title">Sitemap</h4>
              <ul className="footer-links">
                <li><Link to="/" className="footer-link">Home</Link></li>
                <li><Link to="/gallery" className="footer-link">Art Gallery</Link></li>
                <li><Link to="/shop" className="footer-link">Lutoni Shop</Link></li>
                <li><Link to="/videos" className="footer-link">Videos</Link></li>
                <li><Link to="/admin" className="footer-link">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-column-title">Contact</h4>
              <p style={{ opacity: 0.7, lineHeight: '1.8' }}>
                M-Pesa Till / Number: 0723968164 <br />
                Instagram: @artbyoture <br />
                Instagram: @lutoni.ke <br />
                Nairobi, Kenya
              </p>
            </div>
          </div>
          
          <div style={{ marginTop: '60px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.6 }}>
            <span>© 2026 Art By Oture & Lutoni. All Rights Reserved.</span>
            <span>Made with Antigravity AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
