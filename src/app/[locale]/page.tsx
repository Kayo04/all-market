import HeroSection from '@/components/features/HeroSection';
import PopularCategories from '@/components/features/PopularCategories';
import RecentRequests from '@/components/features/RecentRequests';
import HowItWorks from '@/components/features/HowItWorks';
import StatsAndCTA from '@/components/features/StatsAndCTA';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCategories />
      <RecentRequests />
      <HowItWorks />
      <StatsAndCTA />
    </>
  );
}
