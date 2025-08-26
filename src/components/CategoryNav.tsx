import { Button } from "@/components/ui/button";

const categories = [
  { name: "Rooms", active: true },
  { name: "Shops", active: false },
  { name: "Terraces", active: false },
  { name: "Ad Spaces", active: false }
];

export const CategoryNav = () => {
  return (
    <section className="px-4 py-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={category.active ? "default" : "outline"}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};