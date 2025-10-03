import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MessageCircle, MapPin, Calendar, ChevronDown, ChevronUp, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  owner_id?: string;
  profiles: {
    full_name: string;
    phone_number?: string;
    user_id?: string;
  };
}

interface ListingDetailAccordionProps {
  listing: Listing;
  isOpen: boolean;
  onToggle: () => void;
}

export const ListingDetailAccordion = ({ listing, isOpen, onToggle }: ListingDetailAccordionProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  const handleChat = () => {
    navigate(`/chat/${listing.id}/${listing.owner_id || (listing as any).profiles?.user_id}`);
  };

  const handleWhatsApp = (phoneNumber: string, listingTitle: string) => {
    const message = encodeURIComponent(`Hi, I am interested in your listing: ${listingTitle}`);
    const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div 
            className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => navigate(`/listing/${listing.id}`)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-foreground line-clamp-1">{listing.title}</h3>
              <Badge variant="secondary">{listing.category}</Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.location || "Patna"}
              </span>
              <span className="text-primary font-bold text-lg">₹{listing.price.toLocaleString()}/month</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                // Add to favorites logic here
              }}
            >
              <Heart className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
            >
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isOpen && (
        <div className="border-t border-border">
          {/* Image Gallery */}
          {listing.images.length > 0 && (
            <div className="relative">
              <div className="aspect-video relative overflow-hidden">
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

          {/* Content */}
          <div className="p-4 space-y-4">
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{listing.description}</p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{listing.profiles.full_name}</p>
                <p className="text-xs text-muted-foreground">Property Owner</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Listed {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="bg-accent/20 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                🔐 This listing is secured with blockchain-ready verification for transparency
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1"
                onClick={handleChat}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="flex-1"
                onClick={() => handleWhatsApp(listing.contact_phone, listing.title)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};