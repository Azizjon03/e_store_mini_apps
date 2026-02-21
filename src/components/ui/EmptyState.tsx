interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3
        className="text-[20px] font-semibold mb-2"
        style={{ color: 'var(--tg-theme-text-color)' }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-sm mb-6"
          style={{ color: 'var(--tg-theme-hint-color)' }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-[12px] text-sm font-medium"
          style={{
            backgroundColor: 'var(--tg-theme-button-color)',
            color: 'var(--tg-theme-button-text-color)',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
