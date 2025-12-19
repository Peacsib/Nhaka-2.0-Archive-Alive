import { useState, useEffect, useRef, RefObject } from "react";

interface ParallaxOptions {
  speed?: number;
  disabled?: boolean;
}

export const useParallax = <T extends HTMLElement>(
  options: ParallaxOptions = {}
): { ref: RefObject<T>; offset: number } => {
  const { speed = 0.1, disabled = false } = options;
  const ref = useRef<T>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Only calculate when element is in viewport
        if (rect.bottom > 0 && rect.top < windowHeight) {
          const scrollProgress = (windowHeight - rect.top) / (windowHeight + rect.height);
          setOffset(scrollProgress * speed * 100);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, disabled]);

  return { ref, offset };
};

export default useParallax;
