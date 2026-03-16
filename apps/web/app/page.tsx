import Nav from "@/components/landing/Nav";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSolutionSection from "@/components/landing/ProblemSolutionSection";
import PillarsSection from "@/components/landing/PillarsSection";
import MentorshipLayerSection from "@/components/landing/MentorshipLayerSection";
import MentorProfilesSection from "@/components/landing/MentorProfilesSection";
import PricingSection from "@/components/landing/PricingSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FAQSection from "@/components/landing/FAQSection";
import CTAFooterSection from "@/components/landing/CTAFooterSection";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <HeroSection />
        <ProblemSolutionSection />
        <PillarsSection />
        <MentorshipLayerSection />
        <MentorProfilesSection />
        <PricingSection />
        <TestimonialsSection />
        <FAQSection />
        <CTAFooterSection />
      </main>
    </>
  );
}
