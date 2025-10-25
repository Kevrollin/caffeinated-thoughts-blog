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

// Removed default amounts - users must enter custom amount

export const BuyCoffeeModal = ({ isOpen, onClose, postId }: BuyCoffeeModalProps) => {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutRequestId, setCheckoutRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [pollingAttempts, setPollingAttempts] = useState(0);

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

  const getPhoneErrorMessage = (phone: string) => {
    if (!phone) return 'Phone number is required';
    if (phone.length < 10) return 'Phone number is too short';
    if (phone.length > 15) return 'Phone number is too long';
    if (!/^254[17]\d{8}$/.test(phone)) {
      return 'Please enter a valid Kenyan phone number (e.g., 0712345678)';
    }
    return null;
  };

  const handleSubmit = async () => {
    const formattedPhone = formatPhone(phone);
    
    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');
    
    // Validate phone number
    const phoneError = getPhoneErrorMessage(formattedPhone);
    if (phoneError) {
      setErrorMessage(phoneError);
      toast.error(phoneError);
      return;
    }

    // Validate amount
    if (!amount || amount.trim() === '') {
      const error = 'Please enter an amount';
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    const finalAmount = parseInt(amount);
    
    if (isNaN(finalAmount)) {
      const error = 'Please enter a valid number';
      setErrorMessage(error);
      toast.error(error);
      return;
    }
    
    if (finalAmount < 10) {
      const error = 'Minimum amount is KES 10';
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    if (finalAmount > 70000) {
      const error = 'Maximum amount is KES 70,000';
      setErrorMessage(error);
      toast.error(error);
      return;
    }

    setLoading(true);
    setStatus('pending');
    setPollingAttempts(0);

    try {
      console.log('🚀 Sending STK Push request:', { 
        postId, 
        phone: formattedPhone, 
        amount: finalAmount,
        timestamp: new Date().toISOString()
      });
      
      const { data } = await apiClient.post('/payments/stkpush', {
        postId,
        phone: formattedPhone,
        amount: finalAmount,
      });

      console.log('✅ STK Push response:', data);
      setCheckoutRequestId(data.checkoutRequestId);
      
      const successMsg = `STK push sent to ${formattedPhone}! Check your phone to complete payment.`;
      setSuccessMessage(successMsg);
      toast.success(successMsg);
      
      console.log('📱 STK Push sent successfully:', {
        phone: formattedPhone,
        amount: finalAmount,
        checkoutId: data.checkoutRequestId,
        timestamp: new Date().toISOString()
      });
      
      // Start polling for status
      pollPaymentStatus(data.checkoutRequestId);
    } catch (error: any) {
      console.error('❌ STK Push error:', error);
      
      let errorMsg = 'Failed to initiate payment';
      
      if (error.response?.data?.error?.message) {
        errorMsg = error.response.data.error.message;
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      // Handle specific error cases with better user messages
      if (errorMsg.includes('Invalid phone number')) {
        errorMsg = 'Please enter a valid Kenyan phone number registered with M-Pesa';
      } else if (errorMsg.includes('Merchant does not exist')) {
        errorMsg = 'Payment service is temporarily unavailable. Please try again later.';
      } else if (errorMsg.includes('Invalid amount')) {
        errorMsg = 'Please enter a valid amount between KES 10 and KES 70,000';
      } else if (errorMsg.includes('Network error')) {
        errorMsg = 'Network connection issue. Please check your internet and try again.';
      } else if (errorMsg.includes('timeout')) {
        errorMsg = 'Request timed out. Please try again.';
      }
      
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setStatus('failed');
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (reqId: string) => {
    const maxAttempts = 150; // Poll for up to 5 minutes (150 * 2 seconds)
    let attempts = 0;
    let failedAttempts = 0; // Track consecutive failed attempts

    console.log(`🔄 Starting payment status polling for checkout ID: ${reqId}`);

    const poll = setInterval(async () => {
      attempts++;
      setPollingAttempts(attempts);
      
      try {
        console.log(`🔍 Payment status check (attempt ${attempts}/${maxAttempts}):`, {
          checkoutId: reqId,
          timestamp: new Date().toISOString()
        });
        
        const { data } = await apiClient.get(`/payments/${reqId}/status`);
        console.log(`📊 Payment status response:`, data);
        
        if (data.status === 'SUCCESS') {
          console.log('🎉 Payment successful!', {
            transactionId: data.transactionId,
            amount: data.amount,
            phone: data.phone,
            receiptNumber: data.mpesaReceiptNumber,
            timestamp: new Date().toISOString()
          });
          
          setStatus('success');
          setLoading(false);
          clearInterval(poll);
          
          const successMsg = `Payment successful! Receipt: ${data.mpesaReceiptNumber || 'N/A'}`;
          setSuccessMessage(successMsg);
          toast.success('Payment successful! Thank you for your support! ☕');
          
          // Close modal after 3 seconds
          setTimeout(() => {
            onClose();
            resetModal();
          }, 3000);
        } else if (data.status === 'FAILED') {
          const errorCode = data.rawResponse?.resultCode;
          const errorDesc = data.rawResponse?.resultDescription;
          
          console.log('❌ Payment failed:', {
            errorCode,
            errorDesc,
            transactionId: data.transactionId,
            timestamp: new Date().toISOString()
          });
          
          let errorMsg = 'Payment failed';
          
          if (errorCode === 1032) {
            // User cancelled - this is expected, don't treat as error
            errorMsg = 'Payment was cancelled by user. Please try again.';
            setStatus('failed');
            setLoading(false);
            clearInterval(poll);
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          } else if (errorCode === 2029) {
            // Phone/account issue - fail immediately
            errorMsg = 'Phone number not registered with M-Pesa or business account issue. Please check your M-Pesa registration and try again.';
            setStatus('failed');
            setLoading(false);
            clearInterval(poll);
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          } else if (errorCode === 2001) {
            // Insufficient balance - fail immediately
            errorMsg = 'Insufficient balance. Please top up your M-Pesa account and try again.';
            setStatus('failed');
            setLoading(false);
            clearInterval(poll);
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          } else if (errorCode === 11) {
            // Unable to lock subscriber
            errorMsg = 'Unable to process payment. Please ensure your M-Pesa service is active and try again.';
            setStatus('failed');
            setLoading(false);
            clearInterval(poll);
            setErrorMessage(errorMsg);
            toast.error(errorMsg);
          } else {
            // Other errors - wait a bit longer before failing
            failedAttempts++;
            if (failedAttempts >= 3) {
              errorMsg = `Payment failed: ${errorDesc || 'Unknown error'}`;
              setStatus('failed');
              setLoading(false);
              clearInterval(poll);
              setErrorMessage(errorMsg);
              toast.error(errorMsg);
            }
          }
        } else if (data.status === 'PENDING') {
          // Reset failed attempts counter when status is pending
          failedAttempts = 0;
          console.log(`⏳ Payment still pending... (attempt ${attempts}/${maxAttempts})`);
        }
        
        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          console.log('⏰ Payment polling timeout reached');
          setStatus('failed');
          setLoading(false);
          clearInterval(poll);
          const timeoutMsg = 'Payment timeout. Please check your M-Pesa messages or try again.';
          setErrorMessage(timeoutMsg);
          toast.error(timeoutMsg);
        }
      } catch (error) {
        console.error('❌ Status check error:', error);
        failedAttempts++;
        
        if (failedAttempts >= 5 || attempts >= maxAttempts) {
          clearInterval(poll);
          setStatus('failed');
          setLoading(false);
          const networkErrorMsg = 'Unable to check payment status. Please try again.';
          setErrorMessage(networkErrorMsg);
          toast.error(networkErrorMsg);
        }
      }
    }, 2000); // Check every 2 seconds
  };

  const resetModal = () => {
    setPhone('');
    setAmount('');
    setLoading(false);
    setCheckoutRequestId(null);
    setStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
    setPollingAttempts(0);
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
            <span>Thank you for sharing</span>
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
              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Enter Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="10"
                  max="70000"
                  placeholder="Enter amount (10 - 70,000 KES)..."
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={errorMessage ? 'border-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum: KES 10 • Maximum: KES 70,000
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
                )}
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
                  className={errorMessage ? 'border-red-500' : ''}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your M-Pesa registered number
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={loading || !phone || !amount}
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
                  Check your phone for M-Pesa STK Push notification
                </p>
                
                {successMessage && (
                  <div className="mt-2 p-2 bg-emerald/10 border border-emerald/20 rounded-md">
                    <p className="text-xs text-emerald-700 font-medium">{successMessage}</p>
                  </div>
                )}
                
                {checkoutRequestId && (
                  <div className="mt-2 p-2 bg-blue/10 border border-blue/20 rounded-md">
                    <p className="text-xs text-blue-700">
                      Transaction ID: {checkoutRequestId}
                    </p>
                  </div>
                )}
                
                <div className="mt-3 flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-emerald rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-3">
                  Attempt {pollingAttempts}/150 • If you don't receive the prompt, please check:
                </p>
                <ul className="text-xs text-muted-foreground mt-1 text-left">
                  <li>• Phone number is registered with M-Pesa</li>
                  <li>• You have sufficient balance</li>
                  <li>• M-Pesa service is active</li>
                  <li>• Check your phone's notification settings</li>
                </ul>
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
                {successMessage && (
                  <div className="mt-3 p-3 bg-emerald/10 border border-emerald/20 rounded-md">
                    <p className="text-sm text-emerald-700 font-medium">{successMessage}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  This modal will close automatically...
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
                <div className="h-12 w-12 rounded-full bg-red/20 flex items-center justify-center mx-auto mb-4">
                  <Coffee className="h-6 w-6 text-red-500" />
                </div>
                <p className="font-medium text-destructive">Payment Failed</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Please try again or contact support
                </p>
                
                {errorMessage && (
                  <div className="mt-3 p-3 bg-red/10 border border-red/20 rounded-md">
                    <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
                  </div>
                )}
                
                {checkoutRequestId && (
                  <div className="mt-2 p-2 bg-gray/10 border border-gray/20 rounded-md">
                    <p className="text-xs text-gray-600">
                      Transaction ID: {checkoutRequestId}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={resetModal}
                  variant="outline"
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleClose}
                  variant="ghost"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
