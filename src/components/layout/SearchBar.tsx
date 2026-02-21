import { useNavigate } from 'react-router-dom';

export function SearchBar() {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-30 px-4 py-2" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div
        className="flex items-center gap-2 h-9 px-3 rounded-[10px] cursor-pointer"
        style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
        onClick={() => navigate('/search')}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M7 12A5 5 0 107 2a5 5 0 000 10zM14 14l-3.5-3.5"
            stroke="var(--tg-theme-hint-color, #999)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="text-sm"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          Mahsulot qidirish...
        </span>
      </div>
    </div>
  );
}
