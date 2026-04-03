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
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.14),transparent_24%),linear-gradient(180deg,#07101d_0%,#0a1425_38%,#08111f_100%)]" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(180deg,rgba(0,0,0,0.8),transparent_92%)]" />

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
