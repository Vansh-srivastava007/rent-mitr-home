import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const SearchSection = ({ searchQuery, onSearchChange }: SearchSectionProps) => {
  return (
    <section className="bg-gradient-primary text-primary-foreground px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by location or property type..."
            className="pl-10 bg-background text-foreground border-border h-12"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </section>
  );
};