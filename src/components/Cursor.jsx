import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Cursor() {
  const dotRef = useRef(null);
  const followerRef = useRef(null);

  useEffect(() => {
    const dot = dotRef.current;
    const follower = followerRef.current;
    if (!dot || !follower) return;

    // Set initial position out of view
    gsap.set([dot, follower], { x: -100, y: -100 });

    const onMouseMove = (e) => {
      // Position the inner dot instantly
      gsap.to(dot, { 
        x: e.clientX, 
        y: e.clientY, 
        duration: 0 
      });
      // Move the follower ring smoothly
      gsap.to(follower, { 
        x: e.clientX, 
        y: e.clientY, 
        duration: 0.25, 
        ease: 'power2.out' 
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    // Dynamic hover styles
    const onHoverStart = (e) => {
      const target = e.target.closest('a, button, .interactive, [role="button"], input, select, textarea');
      if (!target) return;

      if (target.classList.contains('video-card-interactive') || target.closest('.video-card-interactive')) {
        follower.classList.add('video-hover');
      } else if (target.classList.contains('drag-interactive') || target.closest('.drag-interactive')) {
        follower.classList.add('drag-hover');
      } else {
        follower.classList.add('hovering');
      }
    };

    const onHoverEnd = () => {
      follower.classList.remove('hovering', 'video-hover', 'drag-hover');
    };

    window.addEventListener('mouseover', onHoverStart);
    window.addEventListener('mouseout', onHoverEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onHoverStart);
      window.removeEventListener('mouseout', onHoverEnd);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor" />
      <div ref={followerRef} className="custom-cursor-follower" />
    </>
  );
}
