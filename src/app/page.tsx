import { Navbar } from "@/components/sections/navbar";
import { HeroSection } from "@/components/sections/hero";
import { HistorySection } from "@/components/sections/history";
import { PatternSection } from "@/components/sections/patterns";
import { CraftSection } from "@/components/sections/craft";
import { InnovationSection } from "@/components/sections/innovation";
import { PeopleSection } from "@/components/sections/people";
import { CreationSection } from "@/components/sections/creation";
import { ScrollProgress, BackToTop } from "@/components/sections/scroll-ui";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <ScrollProgress />
      <Navbar />
      <HeroSection />
      <HistorySection />
      <PatternSection />
      <CraftSection />
      <InnovationSection />
      <PeopleSection />
      <CreationSection />
      <Footer />
      <BackToTop />
    </main>
  );
}
