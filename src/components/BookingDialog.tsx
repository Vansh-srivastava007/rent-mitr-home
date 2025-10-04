import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CreditCard, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: {
    id: string;
    title: string;
    price: number;
    owner_id?: string;
  };
}

type BookingStep = 'type' | 'dates' | 'info' | 'payment' | 'success';
type RentalType = 'short-term' | 'long-term';

export const BookingDialog = ({ open, onOpenChange, listing }: BookingDialogProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<BookingStep>('type');
  const [rentalType, setRentalType] = useState<RentalType>('short-term');
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [occupants, setOccupants] = useState('1');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
    // Reset after animation
    setTimeout(() => {
      setStep('type');
      setRentalType('short-term');
      setFromDate(undefined);
      setToDate(undefined);
      setOccupants('1');
      setContactName('');
      setContactPhone('');
    }, 300);
  };

  const handleDatesNext = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to book a property",
        variant: "destructive"
      });
      navigate('/auth');
      handleClose();
      return;
    }

    if (!fromDate || !toDate) {
      toast({
        title: "Select dates",
        description: "Please select both check-in and check-out dates",
        variant: "destructive"
      });
      return;
    }

    setStep('info');
  };

  const handleInfoNext = () => {
    if (!contactName.trim() || !contactPhone.trim() || !occupants) {
      toast({
        title: "Complete information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setStep('payment');
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      // Create booking record
      const { error } = await supabase
        .from('bookings')
        .insert({
          listing_id: listing.id,
          user_id: user!.id,
          from_date: format(fromDate!, 'yyyy-MM-dd'),
          to_date: format(toDate!, 'yyyy-MM-dd'),
          status: 'pending'
        });

      if (error) throw error;

      setProcessing(false);
      setStep('success');
    } catch (error) {
      console.error('Error creating booking:', error);
      setProcessing(false);
      toast({
        title: "Booking failed",
        description: "Failed to create booking. Please try again.",
        variant: "destructive"
      });
    }
  };

  const calculateNights = () => {
    if (!fromDate || !toDate) return 0;
    const diff = toDate.getTime() - fromDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateMonths = () => {
    if (!fromDate || !toDate) return 0;
    const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth());
    return Math.max(1, months);
  };

  const calculateTotal = () => {
    if (rentalType === 'long-term') {
      const months = calculateMonths();
      return months * listing.price;
    } else {
      const nights = calculateNights();
      return nights * listing.price;
    }
  };

  const depositAmount = calculateTotal() * 0.3; // 30% deposit

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' && 'Select Rental Type'}
            {step === 'dates' && 'Select Dates'}
            {step === 'info' && 'Your Information'}
            {step === 'payment' && 'Payment'}
            {step === 'success' && 'Booking Confirmed!'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'type' && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the type of rental that best suits your needs.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => setRentalType('short-term')}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    rentalType === 'short-term'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-semibold mb-1">Short-term Rental</div>
                  <div className="text-sm text-muted-foreground">
                    Perfect for stays from a few days to a few weeks. Priced per night.
                  </div>
                </button>

                <button
                  onClick={() => setRentalType('long-term')}
                  className={cn(
                    "w-full p-4 rounded-lg border-2 text-left transition-all",
                    rentalType === 'long-term'
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-semibold mb-1">Long-term Rental</div>
                  <div className="text-sm text-muted-foreground">
                    Ideal for stays of several months or longer. Monthly rental agreement.
                  </div>
                </button>
              </div>

              <Button onClick={() => setStep('dates')} className="w-full">
                Continue
              </Button>
            </>
          )}

          {step === 'dates' && (
            <>
              <div className="space-y-2">
                <Label>Check-in Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fromDate ? format(fromDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={fromDate}
                      onSelect={setFromDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Check-out Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {toDate ? format(toDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={toDate}
                      onSelect={setToDate}
                      disabled={(date) => !fromDate || date <= fromDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {fromDate && toDate && (
                <div className="bg-accent/20 p-3 rounded-lg">
                  <p className="text-sm">
                    {rentalType === 'long-term' ? (
                      <>
                        <span className="font-medium">{calculateMonths()} month(s)</span>
                        <span className="text-muted-foreground"> × ₹{listing.price.toLocaleString()}/month</span>
                      </>
                    ) : (
                      <>
                        <span className="font-medium">{calculateNights()} nights</span>
                        <span className="text-muted-foreground"> × ₹{listing.price.toLocaleString()}/night</span>
                      </>
                    )}
                  </p>
                  <p className="text-lg font-bold text-primary mt-1">
                    Total: ₹{calculateTotal().toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleDatesNext} className="flex-1">
                  Continue
                </Button>
              </div>
            </>
          )}

          {step === 'info' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupants">Number of Occupants</Label>
                <Input
                  id="occupants"
                  type="number"
                  min="1"
                  placeholder="Number of people"
                  value={occupants}
                  onChange={(e) => setOccupants(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('dates')} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleInfoNext} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </>
          )}

          {step === 'payment' && (
            <>
              <div className="bg-accent/20 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-medium">₹{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Deposit Required (30%)</span>
                  <span className="font-bold text-primary text-lg">₹{depositAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-card border border-border p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Payment Gateway (Demo)</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  This is a demo payment flow. In production, this would integrate with a real payment gateway.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Card Number</span>
                    <span className="font-mono">•••• •••• •••• 4242</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiry</span>
                    <span className="font-mono">12/25</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('info')} className="flex-1" disabled={processing}>
                  Back
                </Button>
                <Button onClick={handlePayment} className="flex-1" disabled={processing}>
                  {processing ? 'Processing...' : `Pay ₹${depositAmount.toLocaleString()}`}
                </Button>
              </div>
            </>
          )}

          {step === 'success' && (
            <>
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Booking Confirmed!</h3>
                <p className="text-muted-foreground mb-4">
                  Your booking request has been submitted successfully.
                </p>
              </div>

              <div className="bg-accent/20 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property</span>
                  <span className="font-medium">{listing.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in</span>
                  <span className="font-medium">{fromDate && format(fromDate, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out</span>
                  <span className="font-medium">{toDate && format(toDate, 'PPP')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit Paid</span>
                  <span className="font-bold text-primary">₹{depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-yellow-600 font-medium">Pending Approval</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  The property owner will review your booking request. You'll receive a notification once it's approved.
                </p>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
