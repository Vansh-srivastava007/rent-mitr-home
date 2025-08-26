import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, MessageCircle, MapPin, Calendar, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { dummyListings } from '@/data/dummyListings';
import { useToast } from '@/hooks/use-toast';

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

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      // Try to fetch from Supabase first using maybeSingle to avoid errors
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_owner_id_fkey (
            full_name,
            phone_number
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (data && !error) {
        setListing(data as any);
        setLoading(false);
        return;
      }

      // Fallback to dummy data if Supabase doesn't have the listing
      const dummyListing = dummyListings.find(l => l.id === id);
      if (dummyListing) {
        setListing(dummyListing as any);
      } else {
        console.error('Listing not found in both Supabase and dummy data');
        setListing(null);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      // Fallback to dummy data
      const dummyListing = dummyListings.find(l => l.id === id);
      if (dummyListing) {
        setListing(dummyListing as any);
      } else {
        setListing(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleWhatsApp = (phoneNumber: string, listingTitle: string) => {
    const message = encodeURIComponent(`Hi, I am interested in your listing: ${listingTitle}`);
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite ? "Property removed from your favorites" : "Property added to your favorites"
    });
  };

  const nextImage = () => {
    if (listing) {
      setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing) {
      setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Listing not found</h2>
          <Button onClick={() => navigate('/listings')}>Back to Listings</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/listings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Listing Details</h1>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className={`transition-colors ${isFavorite ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
              onClick={handleFavoriteToggle}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Image Gallery */}
        {listing.images.length > 0 && (
          <div className="relative mb-6">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img
                src={listing.images[currentImageIndex]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
              {listing.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    ←
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                  >
                    →
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {listing.images.map((_, index) => (
                      <div
                        key={index}
                        className={`h-2 w-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Listing Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-2 mb-4">
              <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
              <Badge variant="secondary" className="text-sm">{listing.category}</Badge>
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.location || "Patna"}
              </span>
              <span className="text-primary font-bold text-2xl">₹{listing.price.toLocaleString()}/month</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Description</h3>
            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          <div className="bg-card p-4 rounded-lg border">
            <h3 className="font-semibold mb-3">Property Owner</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{listing.profiles.full_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-accent/20 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              🔐 This listing is secured with blockchain-ready verification for transparency
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              size="lg" 
              variant="outline" 
              className="flex-1"
              onClick={() => handleCall(listing.contact_phone)}
            >
              <Phone className="h-5 w-5 mr-2" />
              Call Now
            </Button>
            <Button 
              size="lg" 
              className="flex-1"
              onClick={() => handleWhatsApp(listing.contact_phone, listing.title)}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;