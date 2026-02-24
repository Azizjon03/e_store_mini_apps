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

  return (
    <div className="px-4 py-2">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-[20px] whitespace-nowrap text-sm shrink-0 active:scale-[0.95] transition-transform"
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              color: 'var(--tg-theme-text-color)',
            }}
            onClick={() => {
              haptic.selectionChanged();
              navigate(`/catalog/${cat.slug}`);
            }}
          >
            {cat.icon && <span className="text-base">{cat.icon}</span>}
            {cat.image && !cat.icon && (
              <img src={cat.image} alt="" className="w-5 h-5 rounded-full object-cover" />
            )}
            <span>{t(cat.name)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
