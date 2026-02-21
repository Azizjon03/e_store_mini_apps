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

  // Auto-play every 4 seconds
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
    <div className="relative mx-4 mt-2 mb-3">
      <div
        className="relative overflow-hidden rounded-[12px]"
        style={{ height: 160 }}
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
              className="min-w-full h-full flex-shrink-0 cursor-pointer"
              onClick={() => handleClick(banner)}
              style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
            >
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2">
          {banners.map((_, i) => (
            <button
              key={i}
              className="rounded-full transition-all duration-200"
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                backgroundColor:
                  i === current
                    ? 'var(--tg-theme-button-color, #2481cc)'
                    : 'var(--tg-theme-hint-color, #ccc)',
              }}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
