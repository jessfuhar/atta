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
  const favoriteProducts = homeContent.favoriteProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  return (
    <>
      <Hero
        desktop={homeContent.hero.desktop}
        mobile={homeContent.hero.mobile}
        announcement={homeContent.hero.announcement}
      />

      <Reveal className="pb-10 sm:pb-14">
        <Categories categories={resolvedCategories} />
      </Reveal>

      <Reveal className="pb-14 sm:pb-20">
        <ColorCategories colorCategories={colorCategories} />
      </Reveal>

      <Reveal className="pb-28 sm:pb-36">
        <Favorites title={homeContent.favoritesTitle} products={favoriteProducts} />
      </Reveal>

      <Reveal className="pb-28 sm:pb-36">
        <Kits kits={kits} />
      </Reveal>

      <Reveal>
        <Editorial editorial={homeContent.editorial} />
      </Reveal>
    </>
  );
}
