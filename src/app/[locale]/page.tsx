import HeroSection from '@/components/features/HeroSection';
import LiveNeedsFeed from '@/components/features/LiveNeedsFeed';
import SimpleCategoryGrid from '@/components/features/SimpleCategoryGrid';
import PopularCategories from '@/components/features/PopularCategories';
import HowItWorks from '@/components/features/HowItWorks';
import FAQ from '@/components/features/FAQ';
import PreFooterCTA from '@/components/features/PreFooterCTA';

export default function HomePage() {
  return (
    <>
      {/* Content first, like any marketplace: a short hero, then categories and
          live requests above the fold; the explaining comes after. */}
      <HeroSection />
      <PopularCategories />
      <LiveNeedsFeed />
      <HowItWorks />
      <SimpleCategoryGrid />
      <FAQ />
      <PreFooterCTA />
    </>
  );
}
