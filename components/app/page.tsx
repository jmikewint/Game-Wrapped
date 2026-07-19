import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthErrorBanner from "@/components/layout/AuthErrorBanner";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import StatsShowcase from "@/components/landing/StatsShowcase";
import Faq from "@/components/landing/Faq";
import { getCurrentUser } from "@/lib/auth";
import { getLibrarySummary, type LibrarySummary } from "@/lib/library-summary";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ auth_error?: string }>;
}) {
  const [user, { auth_error }] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);

  const library: LibrarySummary | null = user
    ? await getLibrarySummary(user.id)
    : null;

  return (
    <>
      <Navbar user={user} />
      {auth_error ? <AuthErrorBanner code={auth_error} /> : null}
      <main>
        <Hero user={user} library={library} />
        <HowItWorks />
        <StatsShowcase />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
