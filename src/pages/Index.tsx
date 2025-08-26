import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { CategoryNav } from "@/components/CategoryNav";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { TrustSection } from "@/components/TrustSection";
import { BottomNavigation } from "@/components/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <SearchSection />
        <CategoryNav />
        <FeaturedProperties />
        <TrustSection />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Index;
