import { useNavigate } from 'react-router-dom';
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
              onClick={() => {
                const b = bannersMid[0];
                if (b.link_type === 'product' && b.link_value) navigate(`/product/${b.link_value}`);
                else if (b.link_type === 'category' && b.link_value) navigate(`/catalog/${b.link_value}`);
              }}
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
