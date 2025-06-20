import React, { useState } from 'react';

interface PaymentProcessingProps {
  eventTitle: string;
  eventPrice: number;
  eventDate: string;
  eventLocation: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentCancel: () => void;
  className?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'stripe',
    name: 'Credit Card',
    icon: '💳',
    color: 'bg-blue-600 hover:bg-blue-700',
    description: 'Visa, Mastercard, American Express'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: '🔵',
    color: 'bg-blue-500 hover:bg-blue-600',
    description: 'Pay with your PayPal account'
  },
  {
    id: 'apple-pay',
    name: 'Apple Pay',
    icon: '🍎',
    color: 'bg-black hover:bg-gray-800',
    description: 'Quick and secure payment'
  },
  {
    id: 'google-pay',
    name: 'Google Pay',
    icon: '🤖',
    color: 'bg-green-600 hover:bg-green-700',
    description: 'Fast and easy payment'
  }
];

interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  sold: number;
}

const mockTicketTiers: TicketTier[] = [
  {
    id: 'general',
    name: 'General Admission',
    price: 25,
    description: 'Standard event access',
    available: 100,
    sold: 45
  },
  {
    id: 'vip',
    name: 'VIP Access',
    price: 75,
    description: 'Premium seating, exclusive area access',
    available: 20,
    sold: 8
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: 15,
    description: 'Limited time discount',
    available: 50,
    sold: 50
  }
];

export default function PaymentProcessing({ 
  eventTitle, 
  eventPrice, 
  eventDate, 
  eventLocation,
  onPaymentSuccess,
  onPaymentCancel,
  className = "" 
}: PaymentProcessingProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedTicketTier, setSelectedTicketTier] = useState<string>('general');
  const [quantity, setQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const selectedTier = mockTicketTiers.find(tier => tier.id === selectedTicketTier);
  const subtotal = (selectedTier?.price || 0) * quantity;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const paymentData = {
      method: selectedPaymentMethod,
      amount: total,
      ticketTier: selectedTicketTier,
      quantity: quantity,
      transactionId: `txn_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    
    setIsProcessing(false);
    setShowPaymentModal(false);
    onPaymentSuccess(paymentData);
  };

  const getAvailabilityColor = (tier: TicketTier) => {
    const percentage = (tier.sold / (tier.available + tier.sold)) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className={className}>
      {/* Buy Tickets Button */}
      <button
        onClick={() => setShowPaymentModal(true)}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
      >
        <span>🎫</span>
        <span>Buy Tickets</span>
      </button>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Purchase Tickets</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Event Details */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{eventTitle}</h4>
                <p className="text-sm text-gray-600">{eventDate} • {eventLocation}</p>
              </div>

              {/* Ticket Selection */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Select Ticket Type</h4>
                <div className="space-y-3">
                  {mockTicketTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicketTier === tier.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTicketTier(tier.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium text-gray-900">{tier.name}</h5>
                          <p className="text-sm text-gray-600">{tier.description}</p>
                          <p className={`text-sm font-medium ${getAvailabilityColor(tier)}`}>
                            {tier.available} available
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">${tier.price}</div>
                          <div className="text-xs text-gray-500">
                            {tier.sold} sold
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedPaymentMethod === method.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{method.icon}</span>
                        <div>
                          <div className="font-medium text-gray-900">{method.name}</div>
                          <div className="text-xs text-gray-500">{method.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Order Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      {selectedTier?.name} × {quantity}
                    </span>
                    <span className="text-sm text-gray-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Service Fee</span>
                    <span className="text-sm text-gray-900">${serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayment}
                  disabled={!selectedPaymentMethod || isProcessing}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>💳</span>
                      <span>Pay ${total.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Security Notice */}
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Secure payment powered by Stripe. Your payment information is encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 