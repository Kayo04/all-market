import HeroSection from '@/components/features/HeroSection';
import SimpleCategoryGrid from '@/components/features/SimpleCategoryGrid';
import CategoryScrollBar from '@/components/features/CategoryScrollBar';
import PopularCategories from '@/components/features/PopularCategories';
import NeederPro from '@/components/features/NeederPro';
import HowItWorks from '@/components/features/HowItWorks';
import PreFooterCTA from '@/components/features/PreFooterCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoryScrollBar />
      <PopularCategories />
      <NeederPro />
      <SimpleCategoryGrid />
      <HowItWorks />
      <PreFooterCTA />
    </>
  );
}
