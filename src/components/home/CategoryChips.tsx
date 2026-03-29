import { useNavigate } from 'react-router-dom';
import type { Category } from '@/api/types';
import { useHaptic } from '@/hooks/useHaptic';
import { t } from '@/lib/format';

interface CategoryChipsProps {
  categories: Category[];
}

const categoryColors = [
  '#E3F2FD', '#FFF3E0', '#E8F5E9', '#FCE4EC',
  '#F3E5F5', '#E0F7FA', '#FFF8E1', '#EDE7F6',
];

export function CategoryChips({ categories }: CategoryChipsProps) {
  const navigate = useNavigate();
  const haptic = useHaptic();

  if (categories.length === 0) return null;

  const visibleCategories = categories.slice(0, 8);

  return (
    <div className="px-4 py-3">
      <div className="grid grid-cols-4 gap-y-4 gap-x-2">
        {visibleCategories.map((cat, i) => (
          <button
            key={cat.id}
            className="flex flex-col items-center gap-1.5 press-effect"
            onClick={() => {
              haptic.selectionChanged();
              navigate(`/catalog/${cat.slug}`);
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                backgroundColor: cat.color || categoryColors[i % categoryColors.length],
                border: '1px solid rgba(0,0,0,0.04)',
              }}
            >
              {cat.icon ? (
                <span className="text-lg leading-none" style={{ maxWidth: '80%', overflow: 'hidden', textAlign: 'center' }}>{cat.icon}</span>
              ) : cat.image ? (
                <img
                  src={cat.image}
                  alt={t(cat.name)}
                  className="w-7 h-7 object-contain"
                />
              ) : (
                <span className="text-xl leading-none">📦</span>
              )}
            </div>
            <span
              className="text-[10px] leading-tight text-center line-clamp-1 font-medium w-full"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              {t(cat.name)}
            </span>
          </button>
        ))}

        {categories.length > 8 && (
          <button
            className="flex flex-col items-center gap-1.5 press-effect"
            onClick={() => {
              haptic.selectionChanged();
              navigate('/catalog');
            }}
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="5" cy="12" r="2" fill="var(--tg-theme-hint-color)" />
                <circle cx="12" cy="12" r="2" fill="var(--tg-theme-hint-color)" />
                <circle cx="19" cy="12" r="2" fill="var(--tg-theme-hint-color)" />
              </svg>
            </div>
            <span
              className="text-[11px] leading-tight text-center font-medium"
              style={{ color: 'var(--storex-primary)' }}
            >
              Yana
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
