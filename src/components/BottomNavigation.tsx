import { Home, Search, Plus, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Search", active: false },
  { icon: Plus, label: "Post", active: false },
  { icon: Heart, label: "Favorites", active: false },
  { icon: User, label: "Profile", active: false }
];

export const BottomNavigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2">
      <div className="flex justify-around items-center max-w-7xl mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            className={`flex flex-col gap-1 h-auto py-2 ${
              item.active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};