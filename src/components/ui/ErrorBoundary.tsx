import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
            style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
          >
            <span className="text-5xl mb-4">😔</span>
            <h2
              className="text-lg font-semibold mb-2"
              style={{ color: 'var(--tg-theme-text-color)' }}
            >
              Xatolik yuz berdi
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--tg-theme-hint-color)' }}
            >
              Kutilmagan xatolik. Qayta urinib ko'ring.
            </p>
            <button
              className="px-6 py-2.5 rounded-xl text-sm font-medium"
              style={{
                backgroundColor: 'var(--tg-theme-button-color)',
                color: 'var(--tg-theme-button-text-color)',
              }}
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              Qayta yuklash
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
