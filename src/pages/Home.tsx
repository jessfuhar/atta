import { useSiteData } from '../data/siteData';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { ColorCategories } from '../components/ColorCategories';
import { Favorites } from '../components/Favorites';
import { Kits } from '../components/Kits';
import { Editorial } from '../components/Editorial';
import { Reveal } from '../components/Reveal';

export function Home() {
  const { products, resolvedCategories, colorCategories, kits, homeContent } = useSiteData();
  const featuredKits = kits.filter((k) => k.active && k.showOnHome);
  const favoriteItems = homeContent.favoriteProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p))
    .map((product) => {
      const color = homeContent.favoriteVariantColor?.[product.id];
      const variantIndex = Math.max(
        color ? product.variants.findIndex((v) => v.color === color) : 0,
        0,
      );
      return { product, variant: product.variants[variantIndex], variantIndex };
    });

  return (
    <>
      <Hero
        desktop={homeContent.hero.desktop}
        mobile={homeContent.hero.mobile}
        announcement={homeContent.hero.announcement}
      />

      <Reveal className="pb-8 sm:pb-10">
        <Categories categories={resolvedCategories} />
      </Reveal>

      <Reveal className="pb-10 sm:pb-14">
        <ColorCategories colorCategories={colorCategories} />
      </Reveal>

      {featuredKits.length > 0 && (
        <Reveal className="pb-28 sm:pb-36">
          <Kits kits={kits} />
        </Reveal>
      )}

      <Reveal className="pb-28 sm:pb-36">
        <Favorites title={homeContent.favoritesTitle} items={favoriteItems} />
      </Reveal>

      <Reveal>
        <Editorial editorial={homeContent.editorial} />
      </Reveal>
    </>
  );
}
