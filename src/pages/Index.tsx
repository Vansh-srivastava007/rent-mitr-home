import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { CategoryNav } from "@/components/CategoryNav";
import { FeaturedProperties } from "@/components/FeaturedProperties";
import { TrustSection } from "@/components/TrustSection";
import { BottomNavigation } from "@/components/BottomNavigation";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pb-20">
        <SearchSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <CategoryNav />
        <FeaturedProperties searchQuery={searchQuery} />
        <TrustSection />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Index;
