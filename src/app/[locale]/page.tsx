import HeroSection from '@/components/features/HeroSection';
import SimpleCategoryGrid from '@/components/features/SimpleCategoryGrid';
import PopularCategories from '@/components/features/PopularCategories';
import NeederPro from '@/components/features/NeederPro';
import HowItWorks from '@/components/features/HowItWorks';
import FAQ from '@/components/features/FAQ';
import PreFooterCTA from '@/components/features/PreFooterCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCategories />
      <NeederPro />
      <SimpleCategoryGrid />
      <HowItWorks />
      <FAQ />
      <PreFooterCTA />
    </>
  );
}
