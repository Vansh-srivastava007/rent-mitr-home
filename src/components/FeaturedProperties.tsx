import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { dummyListings } from "@/data/dummyListings";
import { ListingDetailAccordion } from "@/components/ListingDetailAccordion";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  images: string[];
  contact_phone: string;
  location?: string;
  profiles: {
    full_name: string;
  };
}

interface FeaturedPropertiesProps {
  searchQuery?: string;
}

export const FeaturedProperties = ({ searchQuery }: FeaturedPropertiesProps) => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  useEffect(() => {
    fetchFeaturedListings();
  }, []);

  const fetchFeaturedListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_owner_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('Error fetching listings:', error);
        // Use dummy data as fallback
        setListings(dummyListings.slice(0, 4) as any);
        return;
      }

      // Combine real data with dummy data
      const combinedListings = [...(data || []), ...dummyListings].slice(0, 4);
      setListings(combinedListings as any);
    } catch (error) {
      console.error('Error:', error);
      // Use dummy data as fallback
      setListings(dummyListings.slice(0, 4) as any);
    } finally {
      setLoading(false);
    }
  };

  // Filter listings based on search query
  const filteredListings = listings.filter((listing) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      listing.title.toLowerCase().includes(query) ||
      listing.category.toLowerCase().includes(query) ||
      (listing.location && listing.location.toLowerCase().includes(query))
    );
  });

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string, listingTitle: string) => {
    const message = encodeURIComponent(`Hi, I'm interested in your listing: ${listingTitle}`);
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  return (
    <section className="px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Featured Properties</h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/listings')}>
            View All
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-muted"></div>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No listings match your search" : "No listings available yet"}
            </p>
            <Button onClick={() => navigate('/upload')}>Upload First Listing</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredListings.map((listing) => (
              <ListingDetailAccordion
                key={listing.id}
                listing={listing as any}
                isOpen={openDetailId === listing.id}
                onToggle={() => setOpenDetailId(openDetailId === listing.id ? null : listing.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};