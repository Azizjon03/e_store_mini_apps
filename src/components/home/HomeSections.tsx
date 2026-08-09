import { useNavigate, type NavigateFunction } from 'react-router-dom';
import type { HomeSection, Banner } from '@/api/types';
import { ProductSection } from '@/components/product/ProductSection';
import { isTelegramWebApp, WebApp } from '@/lib/telegram';

interface HomeSectionsProps {
  sections: HomeSection[];
  bannersMid?: Banner[];
}

// Same admin-free-text sniff HeroBanner.tsx uses for its own tap handler.
// Duplicated (not imported) rather than exported cross-file — see the note
// in Home.tsx for why no shared-utils file was added.
function openBannerLink(linkUrl: string | undefined, navigate: NavigateFunction) {
  if (!linkUrl) return;
  if (/^https?:\/\//i.test(linkUrl)) {
    if (isTelegramWebApp) {
      WebApp.openLink(linkUrl);
    } else {
      window.open(linkUrl, '_blank');
    }
  } else {
    navigate(linkUrl.startsWith('/') ? linkUrl : `/${linkUrl}`);
  }
}

function getSectionLink(section: HomeSection): string | undefined {
  switch (section.type) {
    case 'sale':
      return '/catalog?sort=popular&discount_only=true';
    case 'new':
      return '/catalog?sort=newest';
    case 'popular':
      return '/catalog?sort=popular';
    case 'category':
      return section.category_slug ? `/catalog/${section.category_slug}` : undefined;
  }
}

export function HomeSections({ sections, bannersMid }: HomeSectionsProps) {
  const navigate = useNavigate();
  const hasMidBanner = bannersMid && bannersMid.length > 0;

  return (
    <div>
      {sections.map((section, index) => (
        <div key={`${section.type}-${index}`}>
          <ProductSection
            title={section.title}
            products={section.products}
            linkTo={getSectionLink(section)}
            layout={section.layout}
          />

          {/* Mid-page promo banner after 2nd section */}
          {hasMidBanner && index === 1 && (
            <div
              className="mx-4 my-2 overflow-hidden cursor-pointer press-effect"
              style={{
                borderRadius: 'var(--storex-radius-lg)',
                height: 100,
              }}
              onClick={() => openBannerLink(bannersMid[0].link_url, navigate)}
            >
              <img
                src={bannersMid[0].image}
                alt={bannersMid[0].title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          {/* Divider between sections */}
          {index < sections.length - 1 && <div className="storex-divider" />}
        </div>
      ))}
    </div>
  );
}
