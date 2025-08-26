import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit2, Save, X, Plus, Home, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { dummyListings } from '@/data/dummyListings';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  address: string;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    address: '',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchMyListings();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) {
        throw error;
      }

      setProfile(data);
      setFormData({
        full_name: data.full_name,
        phone_number: data.phone_number,
        address: data.address,
      });
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message || "Failed to load profile data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user?.id);

      if (error) {
        console.error('Error fetching user listings:', error);
        // For demo, show some dummy listings as user's listings
        setMyListings(dummyListings.slice(0, 2));
        return;
      }

      setMyListings(data || []);
    } catch (error) {
      console.error('Error:', error);
      setMyListings(dummyListings.slice(0, 2));
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          address: formData.address,
        })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setProfile({
        ...profile,
        ...formData,
      });

      setEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        address: profile.address,
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">Profile not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background border-b border-border z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Profile</h1>
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Dashboard Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-light rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <p className="text-2xl font-bold">{myListings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary-light rounded-lg">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Bookings</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent-light rounded-lg">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Property Button */}
        <div className="mb-6">
          <Button onClick={() => navigate('/upload')} size="lg" className="w-full md:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Add New Property
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                {editing ? "Update your profile information" : "View your profile details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={!editing}
                  className={!editing ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  disabled={!editing}
                  className={!editing ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!editing}
                  className={!editing ? "bg-muted" : ""}
                />
              </div>

              <div className="bg-accent/20 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  📅 Member since {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>

              {editing && (
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancel} className="flex-1">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Listings */}
          <Card>
            <CardHeader>
              <CardTitle>My Listings</CardTitle>
              <CardDescription>Manage your property listings</CardDescription>
            </CardHeader>
            <CardContent>
              {myListings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No listings yet</p>
                  <Button onClick={() => navigate('/upload')} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Listing
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map((listing) => (
                    <div key={listing.id} className="border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-1">{listing.title}</h4>
                          <p className="text-xs text-muted-foreground">{listing.category}</p>
                          <p className="text-sm font-bold text-primary">₹{listing.price.toLocaleString()}/month</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;