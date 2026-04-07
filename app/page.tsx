import { auth } from "@/auth";
import { HomepageNavbar } from "@/components/homepage/HomepageNavbar";
import { HomepageHeroVisual } from "@/components/homepage/HomepageHeroVisual";
import { HomepagePricing } from "@/components/homepage/HomepagePricing";
import { HomepageRevealObserver } from "@/components/homepage/HomepageRevealObserver";
import {
  HomepageAiSection,
  HomepageCtaSection,
  HomepageFeaturesSection,
  HomepageFooter,
  HomepageHeroCopy,
} from "@/components/homepage/HomepageSections";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = Boolean(session?.user?.id);

  return (
    <>
      <HomepageNavbar isAuthenticated={isAuthenticated} />
      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:40px_40px] mask-[linear-gradient(180deg,rgba(0,0,0,0.6),transparent_88%)]" />

        <section className="mx-auto max-w-7xl px-6 pb-8 pt-12 md:pt-18">
          <HomepageHeroCopy isAuthenticated={isAuthenticated} />
          <HomepageHeroVisual />
        </section>

        <HomepageFeaturesSection />
        <HomepageAiSection />
        <HomepagePricing primaryHref={isAuthenticated ? "/dashboard" : "/register"} />
        <HomepageCtaSection isAuthenticated={isAuthenticated} />
        <HomepageFooter />
      </main>
      <HomepageRevealObserver />
    </>
  );
}
