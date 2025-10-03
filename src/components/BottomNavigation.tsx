import { Home, Search, Plus, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Search, label: "Listings", path: "/listings" },
  { icon: Plus, label: "Upload", path: "/upload" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: User, label: "Profile", path: "/profile" }
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-7xl mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant="ghost"
            size="sm"
            onClick={() => navigate(item.path)}
            className={`flex flex-col gap-1 h-auto py-2 ${
              location.pathname === item.path ? "text-primary" : "text-muted-foreground"
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