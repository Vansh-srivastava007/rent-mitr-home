import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const properties = [
  {
    id: 1,
    title: "Spacious 2BHK Apartment",
    price: "₹25,000/month",
    location: "Patna Central",
    image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=240&fit=crop",
    verified: true
  },
  {
    id: 2,
    title: "Elegant 4BHK Villa", 
    price: "₹80,000/month",
    location: "Boring Road",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=240&fit=crop",
    verified: true
  }
];

export const FeaturedProperties = () => {
  return (
    <section className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Featured Properties</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-medium transition-shadow">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{property.title}</h3>
                  {property.verified && (
                    <Badge variant="secondary" className="text-xs">KYP Verified</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-2">{property.location}</p>
                <p className="text-primary font-bold">{property.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};