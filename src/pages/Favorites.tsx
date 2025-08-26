import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Heart } from 'lucide-react';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites] = useState<any[]>([]);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background border-b border-border z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Favorites</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {favorites.length === 0 ? (
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
            {/* Favorites will be displayed here when implemented */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;