import { useNavigate } from 'react-router-dom';
import type { Category } from '@/api/types';
import { useHaptic } from '@/hooks/useHaptic';
import { t } from '@/lib/format';

interface CategoryChipsProps {
  categories: Category[];
}

export function CategoryChips({ categories }: CategoryChipsProps) {
  const navigate = useNavigate();
  const haptic = useHaptic();

  if (categories.length === 0) return null;

  const overflow = categories.length > 8;
  const visibleCategories = overflow ? categories.slice(0, 7) : categories.slice(0, 8);
  const showMore = overflow || visibleCategories.length % 4 !== 0;

  return (
    <div className="px-4 pt-2 pb-2">
      <div className="grid grid-cols-4 gap-x-3 gap-y-2">
        {visibleCategories.map((cat) => (
          <button
            key={cat.id}
            className="flex flex-col items-center gap-1 press-effect"
            onClick={() => {
              haptic.selectionChanged();
              navigate(`/catalog/${cat.slug}`);
            }}
          >
            <div
              className="w-11 h-11 flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                borderRadius: 'var(--storex-radius-md)',
                color: 'var(--tg-theme-text-color)',
              }}
            >
              {cat.icon ? (
                <span className="text-[20px] leading-none">{cat.icon}</span>
              ) : cat.image ? (
                <img
                  src={cat.image}
                  alt={t(cat.name)}
                  className="w-7 h-7 object-contain"
                />
              ) : (
                <DefaultCatIcon />
              )}
            </div>
            <span
              className="text-[11px] leading-tight text-center line-clamp-1 font-medium w-full"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              {t(cat.name)}
            </span>
          </button>
        ))}

        {showMore && (
          <button
            className="flex flex-col items-center gap-1 press-effect"
            onClick={() => {
              haptic.selectionChanged();
              navigate('/catalog');
            }}
          >
            <div
              className="w-11 h-11 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                borderRadius: 'var(--storex-radius-md)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="5" cy="12" r="1.6" fill="var(--tg-theme-text-color)" />
                <circle cx="12" cy="12" r="1.6" fill="var(--tg-theme-text-color)" />
                <circle cx="19" cy="12" r="1.6" fill="var(--tg-theme-text-color)" />
              </svg>
            </div>
            <span
              className="text-[11px] leading-tight text-center font-medium"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              Boshqa
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function DefaultCatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}
