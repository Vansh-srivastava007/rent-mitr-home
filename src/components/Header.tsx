import { Search, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <img 
            src="https://i.imgur.com/SgcXmEz.jpeg" 
            alt="Rent Mitr" 
            className="h-10 w-10 rounded-full"
          />
          <h1 className="text-xl font-bold text-foreground">Rent Mitr</h1>
        </div>
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};