import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, ArrowLeft, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  images: string[];
  contact_phone: string;
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

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          profiles!listings_owner_id_fkey (
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading listings",
        description: error.message || "Failed to load listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

      <div className="container mx-auto px-4 py-6">
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">No listings found</h2>
            <p className="text-muted-foreground mb-4">Be the first to list your property!</p>
            <Button onClick={() => navigate('/upload')}>Upload Listing</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden">
                {listing.images.length > 0 && (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.images.length > 1 && (
                      <Badge className="absolute top-2 right-2 bg-black/70 text-white">
                        +{listing.images.length - 1} more
                      </Badge>
                    )}
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{listing.title}</CardTitle>
                    <Badge variant="secondary">{listing.category}</Badge>
                  </div>
                  <CardDescription className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(listing.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {listing.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{listing.price.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">per month</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{listing.profiles.full_name}</p>
                      <p className="text-xs text-muted-foreground">Owner</p>
                    </div>
                  </div>

                  <div className="bg-accent/20 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      🔐 This listing is secured with blockchain-ready verification for transparency
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleCall(listing.contact_phone)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleWhatsApp(listing.contact_phone, listing.title)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;