import { useState } from 'react';
import { Coffee, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/lib/api';

interface BuyCoffeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
}

const DEFAULT_AMOUNTS = [50, 100, 200];

export const BuyCoffeeModal = ({ isOpen, onClose, postId }: BuyCoffeeModalProps) => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

  const formatPhone = (value: string) => {
    // Remove non-digits
    let cleaned = value.replace(/\D/g, '');
    
    // Convert 07... to 2547...
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.slice(1);
    }
    
    return cleaned;
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^254[17]\d{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async () => {
    const formattedPhone = formatPhone(phone);
    
    if (!validatePhone(formattedPhone)) {
      toast.error('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    const finalAmount = customAmount ? parseInt(customAmount) : amount;
    
    if (finalAmount < 10) {
      toast.error('Minimum amount is KES 10');
      return;
    }

    setLoading(true);
    setStatus('pending');

    try {
      const { data } = await apiClient.post('/payments/stkpush', {
        postId,
        phone: formattedPhone,
        amount: finalAmount,
      });

      setCheckoutRequestId(data.checkoutRequestId);
      toast.success('STK push sent! Check your phone to complete payment.');
      
      // Start polling for status
      pollPaymentStatus(data.checkoutRequestId);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to initiate payment';
      toast.error(message);
      setStatus('failed');
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (reqId: string) => {
    const maxAttempts = 30; // Poll for up to 1 minute
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      
      try {
        const { data } = await apiClient.get(`/payments/${reqId}/status`);
        
        if (data.status === 'SUCCESS') {
          setStatus('success');
          setLoading(false);
          clearInterval(poll);
          toast.success('Payment successful! Thank you for your support! ☕');
          
          // Close modal after 2 seconds
          setTimeout(() => {
            onClose();
            resetModal();
          }, 2000);
        } else if (data.status === 'FAILED') {
          setStatus('failed');
          setLoading(false);
          clearInterval(poll);
          toast.error('Payment failed. Please try again.');
        } else if (attempts >= maxAttempts) {
          setStatus('failed');
          setLoading(false);
          clearInterval(poll);
          toast.error('Payment timeout. Please check your M-Pesa messages.');
        }
      } catch (error) {
        console.error('Status check error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(poll);
          setStatus('failed');
          setLoading(false);
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const resetModal = () => {
    setPhone('');
    setAmount(100);
    setCustomAmount('');
    setLoading(false);
    setCheckoutRequestId(null);
    setStatus('idle');
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      resetModal();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coffee className="h-5 w-5 text-emerald" />
            <span>Buy Me a Coffee</span>
          </DialogTitle>
          <DialogDescription>
            Support my work with a virtual coffee! ☕
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Amount Selection */}
              <div>
                <Label>Select Amount (KES)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {DEFAULT_AMOUNTS.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant={amount === amt ? 'default' : 'outline'}
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount('');
                      }}
                      className={amount === amt ? 'bg-emerald hover:bg-emerald/90' : ''}
                    >
                      {amt} KES
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <Label htmlFor="customAmount">Or Enter Custom Amount</Label>
                <Input
                  id="customAmount"
                  type="number"
                  min="10"
                  placeholder="Enter amount..."
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />
              </div>

              {/* Phone Number */}
              <div>
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your M-Pesa registered number
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !phone}
                className="w-full bg-emerald hover:bg-emerald/90"
              >
                Send STK Push
              </Button>
            </motion.div>
          )}

          {status === 'pending' && (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Coffee className="h-12 w-12 text-emerald" />
              </motion.div>
              <div className="text-center">
                <p className="font-medium">Waiting for payment...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Check your phone and enter M-Pesa PIN
                </p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-8 space-y-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="h-16 w-16 rounded-full bg-emerald/20 flex items-center justify-center">
                  <Coffee className="h-8 w-8 text-emerald" />
                </div>
              </motion.div>
              <div className="text-center">
                <p className="font-medium text-lg">Payment Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Thank you for your support! ☕
                </p>
              </div>
            </motion.div>
          )}

          {status === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="text-center py-4">
                <p className="font-medium text-destructive">Payment Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try again or contact support
                </p>
              </div>
              <Button
                onClick={resetModal}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
