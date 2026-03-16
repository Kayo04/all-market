import HeroSection from '@/components/features/HeroSection';
import PopularCategories from '@/components/features/PopularCategories';
import NeederPro from '@/components/features/NeederPro';
import HowItWorks from '@/components/features/HowItWorks';
import PreFooterCTA from '@/components/features/PreFooterCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCategories />
      <NeederPro />
      <HowItWorks />
      <PreFooterCTA />
    </>
  );
}
