/**
 * Paddle checkout helpers (hosted links).
 */

'use client';

import React from 'react';

type PaddleTier = 'starter' | 'professional' | 'enterprise';

interface PaddleCheckoutButtonProps {
  tier: PaddleTier;
  label?: string;
  onError?: (error: string) => void;
  className?: string;
}

const CHECKOUT_URLS: Record<PaddleTier, string | undefined> = {
  starter: process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_URL_STARTER,
  professional: process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_URL_PROFESSIONAL,
  enterprise: process.env.NEXT_PUBLIC_PADDLE_CHECKOUT_URL_ENTERPRISE,
};

function getCheckoutUrl(tier: PaddleTier): string | undefined {
  return CHECKOUT_URLS[tier];
}

export const PaddleCheckoutButton: React.FC<PaddleCheckoutButtonProps> = ({
  tier,
  label = 'Get Started',
  onError,
  className = '',
}) => {
  const checkoutUrl = getCheckoutUrl(tier);

  const handleClick = () => {
    if (!checkoutUrl) {
      onError?.('Missing Paddle checkout URL for this tier.');
      return;
    }

    window.location.href = checkoutUrl;
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!checkoutUrl}
      className={`w-full py-3 rounded-lg font-semibold transition ${
        checkoutUrl
          ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-900'
          : 'bg-slate-700 text-slate-300 cursor-not-allowed'
      } ${className}`}
    >
      {checkoutUrl ? label : 'Checkout unavailable'}
    </button>
  );
};

export const PricingCardWithPaddle: React.FC<{
  tier: PaddleTier;
  title: string;
  price: number;
  features: string[];
  className?: string;
}> = ({ tier, title, price, features, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-lg p-6 flex flex-col h-full ${className}`}>
      <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold text-white">${price}</span>
        <span className="text-gray-400 ml-2">/month</span>
      </div>

      <ul className="space-y-3 mb-6 flex-grow">
        {features.map(feature => (
          <li key={feature} className="text-gray-300 flex items-center">
            <span className="text-emerald-400 mr-2">*</span>
            {feature}
          </li>
        ))}
      </ul>

      <PaddleCheckoutButton tier={tier} className="mt-auto" />
    </div>
  );
};
