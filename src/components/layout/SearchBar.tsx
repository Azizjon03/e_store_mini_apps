import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import { useAuthStore } from '@/store/authStore';

export function SearchBar() {
  const navigate = useNavigate();
  const storeConfig = useAppStore((s) => s.storeConfig);
  const user = useAuthStore((s) => s.user);
  const brandName = storeConfig?.company_name || 'StoreX';

  return (
    <div
      className="sticky top-0 z-30 px-4 pt-3 pb-3 flex items-center gap-2.5"
      style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
    >
      <span
        className="text-[20px] font-extrabold tracking-tight shrink-0 storex-gradient-text"
        style={{ letterSpacing: '-0.4px' }}
      >
        {brandName}
      </span>

      <button
        type="button"
        aria-label="Qidirish"
        className="flex-1 flex items-center gap-2 h-10 px-3.5 press-effect"
        style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderRadius: 'var(--storex-radius-full)',
        }}
        onClick={() => navigate('/search')}
      >
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path
            d="M8 14A6 6 0 108 2a6 6 0 000 12zM16 16l-3.5-3.5"
            stroke="var(--tg-theme-hint-color, #9ca3af)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[14px] flex-1 text-left" style={{ color: 'var(--tg-theme-hint-color, #9ca3af)' }}>
          Qidirish
        </span>
      </button>

      <button
        aria-label="Profil"
        className="w-9 h-9 rounded-full overflow-hidden shrink-0 press-effect flex items-center justify-center"
        style={{
          backgroundColor: 'var(--storex-primary-light)',
          color: 'var(--storex-primary)',
        }}
        onClick={() => navigate('/profile')}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="text-[14px] font-bold">
            {user?.name?.[0]?.toUpperCase() ?? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </span>
        )}
      </button>
    </div>
  );
}
