/**
 * Subscription Manager Component
 * Manage active subscriptions (pause, resume, cancel, upgrade)
 */

import React, { useState, useEffect } from 'react';

export default function SubscriptionManager({ subscriptionId }) {
  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [action, setAction] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    fetchSubscription();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchSubscription, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionId]);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/billing/subscription/${subscriptionId}`);
      if (!response.ok) throw new Error('Failed to fetch subscription');
      const { subscription } = await response.json();
      setSubscription(subscription);
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async actionType => {
    try {
      setAction(actionType);
      setError(null);
      setSuccessMessage(null);

      if (actionType === 'cancel') {
        const response = await fetch(`/api/billing/subscription/${subscriptionId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            effectiveFrom: 'end_of_billing_period',
          }),
        });

        if (!response.ok) throw new Error('Failed to cancel subscription');
        setSuccessMessage('Subscription scheduled for cancellation at end of billing period');
      } else {
        const response = await fetch(`/api/billing/subscription/${subscriptionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: actionType }),
        });

        if (!response.ok) throw new Error(`Failed to ${actionType} subscription`);
        setSuccessMessage(`Subscription ${actionType}d successfully`);
      }

      await fetchSubscription();
    } catch (err) {
      console.error('Action error:', err);
      setError(err.message);
    } finally {
      setAction(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  if (isLoading) {
    return <div className="loading">Loading subscription...</div>;
  }

  if (error && !subscription) {
    return <div className="error">Error: {error}</div>;
  }

  if (!subscription) {
    return <div className="no-subscription">No active subscription</div>;
  }

  const isActive = subscription.status === 'active';
  const isPaused = subscription.paused;
  const nextBillingDate = subscription.next_billed_at
    ? new Date(subscription.next_billed_at).toLocaleDateString()
    : 'N/A';

  return (
    <div className="subscription-manager">
      <h2>Subscription Details</h2>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="subscription-info">
        <div className="info-row">
          <span className="label">Status:</span>
          <span className="value">{subscription.status}</span>
        </div>

        <div className="info-row">
          <span className="label">Plan:</span>
          <span className="value">{subscription.items?.[0]?.price?.name || 'Unknown'}</span>
        </div>

        <div className="info-row">
          <span className="label">Price:</span>
          <span className="value">
            {subscription.items?.[0]?.price?.unit_price
              ? `$${(subscription.items[0].price.unit_price / 100).toFixed(2)}`
              : 'N/A'}
            {' / '}
            {subscription.items?.[0]?.price?.billing_cycle?.interval || 'month'}
          </span>
        </div>

        <div className="info-row">
          <span className="label">Next Billing:</span>
          <span className="value">{nextBillingDate}</span>
        </div>

        {subscription.scheduled_change && (
          <div className="info-row scheduled">
            <span className="label">Scheduled Change:</span>
            <span className="value">
              {subscription.scheduled_change.action} at{' '}
              {new Date(subscription.scheduled_change.effective_at).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      <div className="actions">
        {isActive && !isPaused && (
          <button
            onClick={() => handleAction('pause')}
            disabled={action === 'pause'}
            className="btn-secondary"
            title="Pause your subscription"
          >
            {action === 'pause' ? 'Pausing...' : 'Pause'}
          </button>
        )}

        {isPaused && (
          <button
            onClick={() => handleAction('resume')}
            disabled={action === 'resume'}
            className="btn-primary"
            title="Resume your subscription"
          >
            {action === 'resume' ? 'Resuming...' : 'Resume'}
          </button>
        )}

        <button
          onClick={() => handleAction('cancel')}
          disabled={action === 'cancel' || subscription.status === 'cancelled'}
          className="btn-danger"
          title="Cancel subscription at end of billing period"
        >
          {action === 'cancel' ? 'Cancelling...' : 'Cancel'}
        </button>
      </div>

      <style jsx>{`
        .subscription-manager {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          max-width: 500px;
        }

        .subscription-info {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }

        .info-row.scheduled {
          background: #fff3cd;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
        }

        .label {
          font-weight: bold;
          color: #555;
        }

        .value {
          color: #333;
        }

        .actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        button {
          padding: 10px 15px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.2s;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #545b62;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }

        .error-message,
        .success-message {
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 10px;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .success-message {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .loading {
          text-align: center;
          padding: 20px;
          color: #666;
        }

        .no-subscription {
          text-align: center;
          padding: 20px;
          color: #999;
        }
      `}</style>
    </div>
  );
}
