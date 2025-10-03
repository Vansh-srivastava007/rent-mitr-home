import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  listing_id: string;
  listing_title: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_time: string;
  unread: boolean;
}

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to view messages",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    fetchConversations();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Get all messages where user is sender or receiver
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(full_name),
          receiver:profiles!messages_receiver_id_fkey(full_name),
          listing:listings(title)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group messages by conversation (listing + other user)
      const conversationMap = new Map<string, Conversation>();

      messages?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        const conversationKey = `${msg.listing_id}-${otherUserId}`;

        if (!conversationMap.has(conversationKey)) {
          conversationMap.set(conversationKey, {
            id: conversationKey,
            listing_id: msg.listing_id,
            listing_title: msg.listing?.title || 'Property',
            other_user_id: otherUserId,
            other_user_name: msg.sender_id === user.id 
              ? msg.receiver?.full_name 
              : msg.sender?.full_name,
            last_message: msg.body,
            last_message_time: msg.created_at,
            unread: msg.receiver_id === user.id && msg.created_at > new Date(Date.now() - 86400000).toISOString()
          });
        }
      });

      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No messages yet</h2>
            <p className="text-muted-foreground mb-6">
              Start chatting with property owners by visiting listings
            </p>
            <Button onClick={() => navigate('/listings')}>
              Browse Listings
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => navigate(`/chat/${conversation.listing_id}/${conversation.other_user_id}`)}
                className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{conversation.other_user_name}</h3>
                      {conversation.unread && (
                        <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Re: {conversation.listing_title}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.last_message}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(conversation.last_message_time).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
