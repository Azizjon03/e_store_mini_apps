import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

export function SearchBar() {
  const navigate = useNavigate();
  const storeConfig = useAppStore((s) => s.storeConfig);
  const brandName = storeConfig?.company_name || 'StoreX';

  return (
    <div
      className="sticky top-0 z-30 px-4 pt-2 pb-2.5"
      style={{ backgroundColor: 'var(--storex-primary)' }}
    >
      {/* Brand name */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[17px] font-bold tracking-tight text-white">
          {brandName}
        </span>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          onClick={() => navigate('/notifications')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        </button>
      </div>

      {/* Search input */}
      <div
        className="flex items-center gap-2.5 h-10 px-3.5 cursor-pointer"
        style={{
          backgroundColor: 'rgba(255,255,255,0.95)',
          borderRadius: 'var(--storex-radius-md)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
        onClick={() => navigate('/search')}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M8 14A6 6 0 108 2a6 6 0 000 12zM16 16l-3.5-3.5"
            stroke="var(--tg-theme-hint-color, #999)"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-sm flex-1" style={{ color: 'var(--tg-theme-hint-color)' }}>
          Qidirish...
        </span>
      </div>
    </div>
  );
}
