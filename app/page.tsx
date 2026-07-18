import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import StatsShowcase from "@/components/landing/StatsShowcase";
import Faq from "@/components/landing/Faq";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <StatsShowcase />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
