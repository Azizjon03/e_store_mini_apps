interface NetworkErrorProps {
  onRetry: () => void;
  /**
   * `true` (default) owns the whole viewport — for screens that render their
   * own root. Pass `false` inside a `PageLayout`, where the search bar and the
   * TabBar must stay reachable: a full-height block there pushes the retry
   * button under the fixed TabBar, leaving the shopper stuck on the screen
   * that already failed.
   */
  fullScreen?: boolean;
}

export function NetworkError({ onRetry, fullScreen = true }: NetworkErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center px-6 text-center ${
        fullScreen ? 'min-h-screen' : 'min-h-[55vh] py-10'
      }`}
      style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
    >
      <span className="text-5xl mb-4">📡</span>
      <h2
        className="text-lg font-semibold mb-2"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        Internet aloqasi yo'q
      </h2>
      <p
        className="text-sm mb-6"
        style={{ color: 'var(--tg-theme-hint-color)' }}
      >
        Tarmoqqa ulanib qayta urinib ko'ring
      </p>
      <button
        className="px-6 py-2.5 rounded-xl text-sm font-medium"
        style={{
          backgroundColor: 'var(--tg-theme-button-color)',
          color: 'var(--tg-theme-button-text-color)',
        }}
        onClick={onRetry}
      >
        Qayta yuklash
      </button>
    </div>
  );
}
