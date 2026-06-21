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
  const infoHeaderRef = useRef(null);
  const featureHeaderRef = useRef(null);
  const artistHeaderRef = useRef(null);

  // Core showcase items (Only single post paintings from Instagram)
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
      cat: 'Picasso Study',
      img: '/assets/IMG_0559.jpg',
      link: '/gallery'
    },
    {
      title: 'Zebra Lines',
      year: '2026',
      cat: 'Organic Wave',
      img: '/assets/IMG_1333.jpg',
      link: '/gallery'
    },
    {
      title: 'Shattered Minds',
      year: '2026',
      cat: 'Mixed Media',
      img: '/assets/ac01249f-c3e8-43fa-8c76-fbf83d5e5e07.jpg',
      link: '/gallery'
    }
  ];

  useEffect(() => {
    // 1. Page Load Transition (Curtain Lift)
    const tl = gsap.timeline();
    tl.to('.preloader-curtain', {
      yPercent: -100,
      duration: 1.2,
      ease: 'power4.inOut'
    });
    
    // Stagger reveal hero slides
    tl.fromTo('.slide-item', 
      { y: 120, opacity: 0, scale: 0.9 },
      { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out', stagger: 0.15 },
      '-=0.6'
    );

    // 2. Liquid Background Blob follows cursor with lagging delay
    const handleMouseMove = (e) => {
      gsap.to('.blob-1', {
        x: e.clientX - 250,
        y: e.clientY - 250,
        duration: 2.5,
        ease: 'power2.out'
      });
      gsap.to('.blob-2', {
        x: window.innerWidth - e.clientX - 250,
        y: window.innerHeight - e.clientY - 250,
        duration: 4,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    // 3. Horizontal Drag physics for the showcase track
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
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
        xVelocity = e.pageX - lastX;
        lastX = e.pageX;
      };

      const handleMouseUpOrLeave = () => {
        isDragging = false;
        track.style.cursor = 'grab';
        
        const applyInertia = () => {
          if (Math.abs(xVelocity) > 0.5) {
            track.scrollLeft -= xVelocity;
            xVelocity *= 0.92;
            animationFrameId = requestAnimationFrame(applyInertia);
          }
        };
        applyInertia();
      };

      track.addEventListener('mousedown', handleMouseDown);
      track.addEventListener('mousemove', handleMouseMove);
      track.addEventListener('mouseup', handleMouseUpOrLeave);
      track.addEventListener('mouseleave', handleMouseUpOrLeave);

      // Touch Support
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
    // 4. Scroll Trigger animations for text elements
    if (infoHeaderRef.current) {
      gsap.fromTo(infoHeaderRef.current, 
        { opacity: 0, y: 60 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1.2, 
          scrollTrigger: {
            trigger: infoHeaderRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    if (featureHeaderRef.current) {
      gsap.fromTo(featureHeaderRef.current, 
        { opacity: 0, y: 40 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          scrollTrigger: {
            trigger: featureHeaderRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    if (artistHeaderRef.current) {
      gsap.fromTo(artistHeaderRef.current, 
        { opacity: 0, scale: 0.85, rotateY: 15 },
        { 
          opacity: 1, 
          scale: 1, 
          rotateY: 0,
          duration: 1.5, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: artistHeaderRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }

    // Stagger slide glass panels
    gsap.fromTo('.glass-feature-card',
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: '.glass-feature-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse'
        }
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="home-container">
      {/* Preloader Lift-up curtain */}
      <div className="preloader-curtain" />

      {/* Floating Glassmorphic blobs */}
      <div className="glass-accent-blob blob-1" />
      <div className="glass-accent-blob blob-2" />

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

      {/* Double opposite-scrolling Marquee Row */}
      <section className="marquee-section">
        {/* Row 1: Left scrolling solid */}
        <div className="marquee-container">
          <div className="marquee-content">
            <span className="marquee-text">Art By Oture</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Organic Contrast</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Original Paintings</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Waves Collection</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            {/* Duplicate */}
            <span className="marquee-text">Art By Oture</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Organic Contrast</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Original Paintings</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
            <span className="marquee-text">Waves Collection</span>
            <img src="/assets/artbyoture_logo.png" className="marquee-star" alt="Zebra Pattern" />
          </div>
        </div>

        {/* Row 2: Right scrolling outline */}
        <div className="marquee-container">
          <div className="marquee-content reverse">
            <span className="marquee-text outline">Lutoni Wearables</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text outline">Garments Drop</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text outline">Custom Clothing</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text outline">Street Wear Ke</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            {/* Duplicate */}
            <span className="marquee-text outline">Lutoni Wearables</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text outline">Garments Drop</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text outline">Custom Clothing</span>
            <img src="/assets/lutoni_logo.png" className="marquee-star" alt="Blossom Pattern" />
            <span className="marquee-text outline">Street Wear Ke</span>
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
            </div>
          </div>
        </div>
      </section>

      {/* About the Artist Section */}
      <section className="artist-profile-section">
        <div className="container">
          <div className="artist-layout-grid">
            {/* Visual column: Glassmorphic frame with hover play video */}
            <div 
              className="artist-visual-frame glass-panel interactive video-card-interactive"
              onMouseEnter={() => {
                const video = document.querySelector('.artist-profile-video');
                if (video) video.play().catch(() => {});
              }}
              onMouseLeave={() => {
                const video = document.querySelector('.artist-profile-video');
                if (video) video.pause();
              }}
            >
              <img 
                src="/assets/IMG_0959_Original.JPG" 
                className="artist-profile-photo" 
                alt="Artist Calvin Oture Portrait" 
              />
              <video 
                src="/assets/Progress_E2_80_A6_F0_9F_92_9A_20_23acrylicpainting_20_23explore.mp4" 
                className="artist-profile-video" 
                loop 
                muted 
                playsInline 
              />
              <span className="artist-visual-tag">Focused on the path</span>
            </div>

            {/* Info column: Bold typography & story */}
            <div className="artist-info-frame" ref={artistHeaderRef}>
              <h2 className="artist-heading-reveal">
                <span className="artist-bold-name">Calvin Oture</span>
                <span className="artist-bold-title">The Painter & Creator</span>
              </h2>
              
              <p className="artist-story-p">
                Calvin Oture is a contemporary visual artist and garment designer based in Nairobi, Kenya. Merging organic wavy line designs with heavy textures, his work translates raw canvas emotion directly into streetwear garments.
              </p>
              
              <p className="artist-story-p italic">
                "Everything you can imagine is real. The flows of the canvas weave directly into the garments."
              </p>
              
              <div className="artist-actions">
                <a 
                  href="https://www.instagram.com/artbyoture/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="artist-social-btn glass-panel interactive"
                >
                  Instagram @artbyoture
                </a>
                <a 
                  href="https://www.instagram.com/lutoni.ke/?hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="artist-social-btn glass-panel red-accent interactive"
                >
                  Instagram @lutoni.ke
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Glassmorphic Feature Section */}
      <section className="glass-feature-section">
        <div className="container">
          <h2 className="glass-feature-title" ref={featureHeaderRef}>The Creative Division</h2>
          
          <div className="glass-feature-grid">
            {/* Card 1: Canvas Art */}
            <div className="glass-feature-card glass-panel">
              <span className="feature-tag">100% Original Canvas</span>
              <h3 className="feature-title">Canvas Art</h3>
              <p className="feature-desc">
                Original textured acrylic and oil paintings displaying abstract waves, Picasso studies, and organic cubism compositions.
              </p>
              <div className="feature-meta-stats">
                9 Paintings • Commissions Open
              </div>
              <Link to="/gallery" className="feature-btn interactive">
                <span>View Paintings</span> <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 2: Wearable streetwear */}
            <div className="glass-feature-card glass-panel">
              <span className="feature-tag">Streetwear engineering</span>
              <h3 className="feature-title">Lutoni Wear</h3>
              <p className="feature-desc">
                Heavyweight cotton tees, luxury hoodies, and jacquard garments drop, printed and embroidered with visual motifs.
              </p>
              <div className="feature-meta-stats">
                Garments drop • sizes s-xl
              </div>
              <Link to="/shop" className="feature-btn interactive">
                <span>Enter Shop</span> <ArrowRight size={14} />
              </Link>
            </div>

            {/* Card 3: Process video clips */}
            <div className="glass-feature-card glass-panel">
              <span className="feature-tag">process footage</span>
              <h3 className="feature-title">Studio Sessions</h3>
              <p className="feature-desc">
                Edgy footage capturing texture creations, fine line layering, and paint blends directly from the artist's studio.
              </p>
              <div className="feature-meta-stats">
                11 process clips • scroll-triggered
              </div>
              <Link to="/videos" className="feature-btn interactive">
                <span>Watch Showcase</span> <ArrowRight size={14} />
              </Link>
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
                Expressive painting meets streetwear garments. An collaboration of textures, zebra wave motifs, and high-end visual design.
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
