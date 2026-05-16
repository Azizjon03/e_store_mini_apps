import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Banner } from '@/api/types';

interface HeroBannerProps {
  banners: Banner[];
}

export function HeroBanner({ banners }: HeroBannerProps) {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const touchStartX = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % banners.length) + banners.length) % banners.length);
    },
    [banners.length],
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [banners.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    clearInterval(intervalRef.current);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  };

  const handleClick = (banner: Banner) => {
    if (banner.link_type === 'product' && banner.link_value) {
      navigate(`/product/${banner.link_value}`);
    } else if (banner.link_type === 'category' && banner.link_value) {
      navigate(`/catalog/${banner.link_value}`);
    }
  };

  if (banners.length === 0) return null;

  return (
    <div className="relative mx-4 mt-1 mb-1">
      <div
        className="relative overflow-hidden"
        style={{ height: 140, borderRadius: 'var(--storex-radius-lg)' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="min-w-full h-full shrink-0 cursor-pointer relative"
              onClick={() => handleClick(banner)}
              style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {/* Bottom gradient for legibility */}
              <div
                className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none"
                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
              />
              {/* Glassmorphism title chip */}
              <div className="absolute bottom-3 left-3 right-20">
                <div
                  className="inline-block px-3 py-2 storex-glass"
                  style={{ borderRadius: 'var(--storex-radius-md)' }}
                >
                  <h3 className="text-white text-[15px] font-bold leading-tight">
                    {banner.title}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            {banners.map((_, i) => (
              <button
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? 16 : 5,
                  height: 5,
                  backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.5)',
                }}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
