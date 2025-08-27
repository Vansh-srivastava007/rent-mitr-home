import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  created_at: string;
}

interface FavoriteListing {
  id: string;
  listing_id: string;
  listings: Listing;
}

const Favorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          listing_id,
          listings (
            id,
            title,
            description,
            price,
            category,
            images,
            created_at
          )
        `)
        .eq('user_id', user?.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, listingId: string) => {
    try {
      await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);
      
      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      
      toast({
        title: "Removed from favorites",
        description: "Property removed from your favorites"
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Sign in required</h2>
          <p className="text-muted-foreground mb-4">Please sign in to view your favorites</p>
          <Button onClick={() => navigate('/auth')}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 bg-background border-b border-border z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Favorites</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold text-muted-foreground mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-4">Start adding properties to your favorites!</p>
            <Button onClick={() => navigate('/listings')}>Browse Listings</Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <div onClick={() => navigate(`/listing/${favorite.listings.id}`)}>
                  {favorite.listings.images && favorite.listings.images.length > 0 && (
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={favorite.listings.images[0]}
                        alt={favorite.listings.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg line-clamp-1">{favorite.listings.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(favorite.id, favorite.listings.id);
                        }}
                      >
                        <Heart className="h-4 w-4 fill-current text-red-500" />
                      </Button>
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      {favorite.listings.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {favorite.listings.description}
                    </p>
                    <p className="text-lg font-semibold text-primary">
                      ${favorite.listings.price.toLocaleString()}
                    </p>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;