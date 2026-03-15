/**
 * Checkout Component
 * Handles Paddle payment processing
 */

import React, { useState } from 'react';

export default function Checkout({ priceId, onSuccess, onError }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [billingDetails, setBillingDetails] = useState({
    country: 'US',
  });

  const handleCheckout = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (!email || !name) {
        throw new Error('Please provide email and name');
      }

      // Process payment through Paddle
      const response = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          items: [{ priceId, quantity: 1 }],
          billingDetails: {
            ...billingDetails,
            name,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment failed');
      }

      const { paymentUrl, transaction } = await response.json();

      // Redirect to Paddle checkout
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        throw new Error('No payment URL provided');
      }

      onSuccess?.(transaction);
    } catch (err) {
      const errorMsg = err.message || 'Checkout failed';
      setError(errorMsg);
      console.error('Checkout error:', err);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleCheckout} className="checkout-form">
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="John Doe"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="country">Country</label>
        <input
          id="country"
          type="text"
          value={billingDetails.country}
          onChange={e => setBillingDetails({ ...billingDetails, country: e.target.value })}
          placeholder="US"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="error-message" role="alert">
          {error}
        </div>
      )}

      <button type="submit" disabled={isLoading || !email || !name} className="checkout-button">
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </button>

      <p className="security-badge">Secured by Paddle</p>
    </form>
  );
}
