import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Volume2, VolumeX } from 'lucide-react';
import './Videos.css';

gsap.registerPlugin(ScrollTrigger);

export default function Videos() {
  const [muted, setMuted] = useState(true);
  const containerRef = useRef(null);

  const videoItems = [
    {
      label: 'The Process / Painting Wave Lines',
      word: 'WAVES',
      src: '/assets/I_20haven_E2_80_99t_20had_20this_20much_20fun_20working_20on_20a_20piece_20in_20a_20while.._20can_E2_80_99t_20wait_20to_20share_20the_20final_20produc.mp4'
    },
    {
      label: 'Acrylic Layering Progress',
      word: 'DETAIL',
      src: '/assets/Progress_E2_80_A6_F0_9F_92_9A_20_23acrylicpainting_20_23explore.mp4'
    },
    {
      label: 'Cubism Studio Picasso Study',
      word: 'CUBISM',
      src: '/assets/Pulled_20some_20inspiration_20from_20Picasso_20for_20this_20cubism_20piece._20Coming_20soon_20_F0_9F_98_89_F0_9F_8E_A8.mp4'
    },
    {
      label: 'Fine Strokes & Texture Work',
      word: 'SHATTER',
      src: '/assets/0873F2E2-D268-49B5-B1B9-126646E0D83D.MP4'
    },
    {
      label: 'Fluid Acrylic Flow & Movement',
      word: 'ORGANIC',
      src: '/assets/3878A53A-81AA-493F-942B-3D6244C95961.MP4'
    }
  ];

  // Hover triggers for playing videos
  const handleMouseEnter = (e) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.play().catch(err => console.log('Video play interrupted:', err));
    }
  };

  const handleMouseLeave = (e) => {
    const video = e.currentTarget.querySelector('video');
    if (video) {
      video.pause();
    }
  };

  const toggleSound = () => {
    setMuted(!muted);
    // Find all video tags on page and update their muted property
    const videos = document.querySelectorAll('video');
    videos.forEach(v => {
      v.muted = !muted;
    });
  };

  useEffect(() => {
    // Apply GSAP ScrollTrigger skew and movement to giant text overlays
    const panels = gsap.utils.toArray('.video-panel-item');
    
    panels.forEach(panel => {
      const text = panel.querySelector('.panel-giant-word');
      
      gsap.fromTo(text, 
        { y: -30, skewX: 5 },
        {
          y: 30,
          skewX: -5,
          ease: 'none',
          scrollTrigger: {
            trigger: panel,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <div className="videos-page-container" ref={containerRef}>
      
      {/* Intro section */}
      <div className="videos-intro-header">
        <h1 className="videos-main-title">Oture Showcase</h1>
        <p className="videos-sub-desc">
          Edgy, raw painting footage straight from the studio. Hover over any panel to play, click anywhere to toggle audio, and watch the process come alive.
        </p>
        
        <button 
          onClick={toggleSound}
          style={{
            marginTop: '25px',
            background: 'none',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          className="interactive"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          <span>{muted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </div>

      {/* Panels list */}
      <div className="video-panels-container">
        {videoItems.map((item, index) => (
          <div 
            key={index}
            className="video-panel-item video-card-interactive"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={toggleSound}
          >
            <video 
              src={item.src} 
              className="panel-video-bg"
              loop
              muted={muted}
              playsInline
            />
            
            <div className="panel-text-overlay">
              <h2 className="panel-giant-word">{item.word}</h2>
              <span className="panel-label">{item.label}</span>
            </div>

            <div className="sound-toggle-hint">
              Click to {muted ? 'Unmute' : 'Mute'}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
