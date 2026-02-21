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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--tg-theme-bg-color)' }}>
      {showSearch && <SearchBar />}
      <main className="flex-1" style={{ paddingBottom: showTabBar ? 'calc(56px + env(safe-area-inset-bottom, 0px))' : 0 }}>
        {children}
      </main>
      {showTabBar && <TabBar />}
    </div>
  );
}
