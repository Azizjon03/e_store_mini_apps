import type { HomeSection, Banner } from '@/api/types';
import { ProductSection } from '@/components/product/ProductSection';

interface HomeSectionsProps {
  sections: HomeSection[];
  bannersMid?: Banner[];
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
  // Insert mid-banner after 3rd section if exists
  const hasMidBanner = bannersMid && bannersMid.length > 0;

  return (
    <div>
      {sections.map((section, index) => (
        <div key={`${section.type}-${index}`}>
          <ProductSection
            title={section.title}
            products={section.products}
            linkTo={getSectionLink(section)}
          />

          {/* Mid-page banner after 3rd section */}
          {hasMidBanner && index === 2 && (
            <div className="mx-4 my-3 rounded-[12px] overflow-hidden" style={{ height: 100 }}>
              <img
                src={bannersMid[0].image}
                alt={bannersMid[0].title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
