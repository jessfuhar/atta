import { useSiteData } from '../data/siteData';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { ColorCategories } from '../components/ColorCategories';
import { Favorites } from '../components/Favorites';
import { Editorial } from '../components/Editorial';
import { Reveal } from '../components/Reveal';

export function Home() {
  const { products, categories, colorCategories, homeContent } = useSiteData();
  const favoriteProducts = homeContent.favoriteProductIds
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  return (
    <>
      <Hero hero={homeContent.hero} />

      <Reveal className="pb-28 sm:pb-36">
        <Categories categories={categories} />
      </Reveal>

      <Reveal className="pb-28 sm:pb-36">
        <ColorCategories colorCategories={colorCategories} />
      </Reveal>

      <Reveal className="pb-28 sm:pb-36">
        <Favorites title={homeContent.favoritesTitle} products={favoriteProducts} />
      </Reveal>

      <Reveal>
        <Editorial editorial={homeContent.editorial} />
      </Reveal>
    </>
  );
}
