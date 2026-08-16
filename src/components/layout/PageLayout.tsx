import type { ReactNode } from 'react';
import { SearchBar } from './SearchBar';
import { TabBar } from './TabBar';

interface PageLayoutProps {
  children: ReactNode;
  showSearch?: boolean;
  showTabBar?: boolean;
}

export function PageLayout({
  children,
  showSearch = true,
  showTabBar = true,
}: PageLayoutProps) {
  return (
    // Full-viewport ground: on desktop / Telegram Desktop this is the visible
    // "outside the phone" surface. Below --storex-app-max-width the centered
    // column below fills it completely, so this background never shows and
    // nothing about the phone rendering changes.
    // `overflow-x-clip`, not `overflow-x-hidden`: `hidden` on one axis forces
    // the other axis to compute as `auto`, which turns each of these wrappers
    // into a scroll container. `position: sticky` then pins to a box that never
    // scrolls, so the search bar, the orders filter chips and the profile
    // header all scrolled away with the page. `clip` bounds the overflow
    // without creating a scroll container.
    <div
      className="min-h-screen flex justify-center overflow-x-clip"
      style={{ backgroundColor: 'var(--tg-theme-secondary-bg-color)' }}
    >
      <div
        className="w-full min-h-screen flex flex-col overflow-x-clip max-w-(--storex-app-max-width)"
        style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}
      >
        {showSearch && <SearchBar />}
        <main
          className="flex-1 overflow-x-clip"
          style={{
            paddingBottom: showTabBar
              ? 'calc(var(--storex-tabbar-height, 56px) + env(safe-area-inset-bottom, 0px))'
              : 0,
            backgroundColor: 'var(--tg-theme-bg-color)',
          }}
        >
          {children}
        </main>
      </div>
      {showTabBar && <TabBar />}
    </div>
  );
}
