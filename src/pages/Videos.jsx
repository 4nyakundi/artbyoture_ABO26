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
      src: '/videos/I_20haven_E2_80_99t_20had_20this_20much_20fun_20working_20on_20a_20piece_20in_20a_20while.._20can_E2_80_99t_20wait_20to_20share_20the_20final_20produc.mp4'
    },
    {
      label: 'Acrylic Layering Progress',
      word: 'DETAIL',
      src: '/videos/Progress_E2_80_A6_F0_9F_92_9A_20_23acrylicpainting_20_23explore.mp4'
    },
    {
      label: 'Fine Strokes & Texture Work',
      word: 'SHATTER',
      src: '/videos/0873F2E2-D268-49B5-B1B9-126646E0D83D.MP4'
    },
    {
      label: 'Fluid Acrylic Flow & Movement',
      word: 'FLOW',
      src: '/videos/3878A53A-81AA-493F-942B-3D6244C95961.MP4'
    },
    {
      label: 'Brushing Canvas Layers',
      word: 'CANVAS',
      src: '/videos/52C92DE6-F596-4C48-BAE8-E76FF80F0685.MP4'
    },
    {
      label: 'Abstract Shapes Composition',
      word: 'SHAPES',
      src: '/videos/DDE13BA2-6844-413B-AFC1-C223020A17B6.MP4'
    },
    {
      label: 'Dynamic Art Strokes',
      word: 'STROKES',
      src: '/videos/E45356A6-F477-4FF4-AA1C-2E034C14EF62.MP4'
    },
    {
      label: 'Zebra Pattern Layering',
      word: 'ZEBRA',
      src: '/videos/v09044g40000ckr0be7og65r0npr5p7g.MP4'
    },
    {
      label: 'Lutoni Blossom Wear Print',
      word: 'BLOSSOM',
      src: '/videos/v09044g40000cqesjjnog65o0ifiialg.MP4'
    },
    {
      label: 'Shadow Depth Contrast',
      word: 'SHADOW',
      src: '/videos/v09044g40000cr7f7jfog65kb4ko49h0.MP4'
    },
    {
      label: 'Textured Surface Experiment',
      word: 'TEXTURE',
      src: '/videos/v09044g40000ctebos7og65inlsgqq9g.MP4'
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
        { y: -35, skewX: 6 },
        {
          y: 35,
          skewX: -6,
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
