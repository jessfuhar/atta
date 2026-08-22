import { useSiteData } from '../data/siteData';
import { Hero } from '../components/Hero';
import { Categories } from '../components/Categories';
import { Favorites } from '../components/Favorites';
import { Editorial } from '../components/Editorial';
import { Reveal } from '../components/Reveal';

export function Home() {
  const { products, categories, homeContent } = useSiteData();
  const favoriteProducts = products.filter((product) =>
    homeContent.favoriteProductIds.includes(product.id),
  );

  return (
    <>
      <Hero hero={homeContent.hero} />

      <Reveal className="pb-28 sm:pb-36">
        <Categories categories={categories} />
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
