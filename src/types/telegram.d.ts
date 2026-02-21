interface Window {
  Telegram?: {
    WebApp?: {
      initData: string;
      initDataUnsafe: {
        user?: {
          id: number;
          first_name: string;
          last_name?: string;
          username?: string;
          photo_url?: string;
          language_code?: string;
          is_premium?: boolean;
        };
        start_param?: string;
      };
      colorScheme: 'light' | 'dark';
      themeParams: Record<string, string>;
      isExpanded: boolean;
      ready: () => void;
      expand: () => void;
      close: () => void;
      MainButton: {
        text: string;
        isVisible: boolean;
        isActive: boolean;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
        setText: (text: string) => void;
        setParams: (params: Record<string, string>) => void;
        showProgress: (leaveActive?: boolean) => void;
        hideProgress: () => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
      };
      BackButton: {
        isVisible: boolean;
        show: () => void;
        hide: () => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
      };
      HapticFeedback: {
        selectionChanged: () => void;
        impactOccurred: (style: string) => void;
        notificationOccurred: (type: string) => void;
      };
      showAlert: (message: string) => void;
      showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
      openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
      openTelegramLink: (url: string) => void;
      enableClosingConfirmation: () => void;
    };
  };
}
