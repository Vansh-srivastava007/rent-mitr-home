import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  body: string;
  created_at: string;
}

interface Listing {
  title: string;
  owner_id: string;
}

const Chat = () => {
  const { listingId, otherUserId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);
  const [otherUserName, setOtherUserName] = useState('User');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to chat",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    fetchChatData();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${listingId}-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `listing_id=eq.${listingId}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId) ||
            (newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, listingId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatData = async () => {
    if (!user || !listingId || !otherUserId) return;

    try {
      // Fetch listing info
      const { data: listingData } = await supabase
        .from('listings')
        .select('title, owner_id')
        .eq('id', listingId)
        .single();

      if (listingData) {
        setListing(listingData);
      }

      // Fetch other user's profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', otherUserId)
        .single();

      if (profileData) {
        setOtherUserName(profileData.full_name);
      }

      // Fetch messages
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('listing_id', listingId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(messagesData || []);
    } catch (error) {
      console.error('Error fetching chat data:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user || !listingId || !otherUserId || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: otherUserId,
          listing_id: listingId,
          body: newMessage.trim()
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSending(false);
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
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border z-40">
        <div className="flex items-center gap-4 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{otherUserName}</h1>
            {listing && (
              <p className="text-sm text-muted-foreground truncate">
                Re: {listing.title}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                  message.sender_id === user?.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                <p className="text-sm break-words">{message.body}</p>
                <p className={`text-xs mt-1 ${
                  message.sender_id === user?.id 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-background p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
