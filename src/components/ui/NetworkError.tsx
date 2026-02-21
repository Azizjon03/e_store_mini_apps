interface NetworkErrorProps {
  onRetry: () => void;
}

export function NetworkError({ onRetry }: NetworkErrorProps) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
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
