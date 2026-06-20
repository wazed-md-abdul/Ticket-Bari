"use client";

import { useState, useEffect, useRef } from "react";

export default function CountUp({ end, duration = 1500, suffix = "" }) {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    const endNum = parseInt(end.toString().replace(/[^0-9]/g, ""), 10);
    if (isNaN(endNum)) return;

    let animationFrameId;
    let startTime = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          startTime = null; // reset start time for animation
          const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // Easing Out Quad formula
            const easedProgress = progress * (2 - progress);
            setCount(Math.floor(easedProgress * endNum));

            if (progress < 1) {
              animationFrameId = requestAnimationFrame(animate);
            } else {
              setCount(endNum);
            }
          };
          animationFrameId = requestAnimationFrame(animate);
          observer.disconnect(); // Animate only once
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, [end, duration]);

  // Format with commas if large number
  const formattedCount = count.toLocaleString();

  return <span ref={countRef}>{formattedCount}{suffix}</span>;
}
