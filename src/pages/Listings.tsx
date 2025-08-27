import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { dummyListings } from '@/data/dummyListings';
import { ListingDetailAccordion } from '@/components/ListingDetailAccordion';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  contact_phone: string;
  location?: string;
  created_at: string;
  profiles: {
    full_name: string;
    phone_number: string;
  };
}

const Listings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      // Use secure function that hides contact_phone from unauthenticated users
      const { data, error } = await supabase.rpc('get_listings_safe');

      if (error) {
        console.error('Error fetching listings:', error);
        // Use dummy data as fallback
        setListings(dummyListings as any);
        return;
      }

      // Get profiles for the listings
      const profilePromises = (data || []).map(async (listing: any) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('user_id', listing.owner_id)
          .single();
        
        return {
          ...listing,
          profiles: profile || { full_name: 'Anonymous', phone_number: '' }
        };
      });

      const listingsWithProfiles = await Promise.all(profilePromises);
      
      // Combine real data with dummy data
      const combinedListings = [...listingsWithProfiles, ...dummyListings];
      setListings(combinedListings as any);
    } catch (error: any) {
      console.error('Error:', error);
      // Use dummy data as fallback
      setListings(dummyListings as any);
      toast({
        title: "Using sample data",
        description: "Showing sample listings for demonstration.",
      });
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
      listing.description.toLowerCase().includes(query) ||
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background border-b border-border z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">All Listings</h1>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-gradient-primary text-primary-foreground px-4 py-6">
        <div className="container mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search listings by title, category, or location..."
              className="pl-10 bg-background text-foreground border-border h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">
              {searchQuery ? "No listings match your search" : "No listings found"}
            </h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try a different search term" : "Be the first to list your property!"}
            </p>
            <Button onClick={() => navigate('/upload')}>Upload Listing</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {searchQuery ? `Found ${filteredListings.length} listings` : `All Listings (${filteredListings.length})`}
              </h2>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                  Clear Search
                </Button>
              )}
            </div>
            
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
    </div>
  );
};

export default Listings;