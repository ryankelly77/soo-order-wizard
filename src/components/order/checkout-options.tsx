'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useOrderWizardStore } from '@/stores/order-wizard.store';
import { useAuth } from '@/features/auth';
import type { CheckoutMode } from '@/contracts/types';

interface CheckoutOptionsProps {
  onContinue: () => void;
  subtotal: number;
}

export function CheckoutOptions({ onContinue, subtotal }: CheckoutOptionsProps) {
  const { isAuthenticated, user } = useAuth();
  const { checkoutMode, setCheckoutMode, setIsGuest, setGuestInfo } =
    useOrderWizardStore();

  // If user is authenticated, skip checkout options and go directly to payment
  if (isAuthenticated && user) {
    return (
      <AuthenticatedCheckout
        user={user}
        subtotal={subtotal}
        onContinue={onContinue}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="form-section-title">How would you like to continue?</h2>
        <p className="text-sm text-[var(--soo-text-muted)]">
          Choose an option below to complete your order
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Guest Checkout Option */}
        <CheckoutOptionCard
          selected={checkoutMode === 'guest'}
          onClick={() => setCheckoutMode('guest')}
          icon="✉️"
          title="Continue as Guest"
          description="Quick checkout with email only. No account required."
          benefits={[
            'Fastest checkout option',
            'Order confirmation via email',
            'Track your order with a link',
          ]}
        />

        {/* Create Account Option */}
        <CheckoutOptionCard
          selected={checkoutMode === 'create-account'}
          onClick={() => setCheckoutMode('create-account')}
          icon="👤"
          title="Create Account"
          description="Save your info for faster future orders."
          benefits={[
            'Save addresses & payment methods',
            'View order history',
            'Exclusive member promotions',
          ]}
        />
      </div>

      {/* Sign In Link */}
      <div className="text-center">
        <span className="text-sm text-[var(--soo-text-muted)]">
          Already have an account?{' '}
        </span>
        <Link
          href={`/login?redirect=/order/new?step=payment`}
          className="text-sm font-medium text-[var(--soo-red)] hover:underline"
        >
          Sign In
        </Link>
      </div>

      {/* Checkout Form based on selection */}
      {checkoutMode === 'guest' && (
        <GuestCheckoutForm
          onSubmit={(email) => {
            setIsGuest(true);
            setGuestInfo({ email });
            onContinue();
          }}
        />
      )}

      {checkoutMode === 'create-account' && (
        <CreateAccountForm
          onSubmit={(email, password) => {
            // This would trigger account creation then continue
            // For now, just set guest info and continue
            setIsGuest(false);
            setGuestInfo({ email });
            onContinue();
          }}
        />
      )}
    </div>
  );
}

// Option card component
interface CheckoutOptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  description: string;
  benefits: string[];
}

function CheckoutOptionCard({
  selected,
  onClick,
  icon,
  title,
  description,
  benefits,
}: CheckoutOptionCardProps) {
  return (
    <div
      className={`payment-method ${selected ? 'selected' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      style={{ padding: '24px', alignItems: 'flex-start', textAlign: 'left' }}
    >
      <span className="payment-method-icon">{icon}</span>
      <div>
        <span className="payment-method-label">{title}</span>
        <span
          className="payment-method-desc"
          style={{ display: 'block', marginTop: '4px' }}
        >
          {description}
        </span>
        <ul
          style={{
            marginTop: '12px',
            fontSize: '12px',
            color: 'var(--soo-text-muted)',
          }}
        >
          {benefits.map((benefit, index) => (
            <li
              key={index}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span style={{ color: 'var(--soo-success)' }}>✓</span>
              {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Guest checkout form
interface GuestCheckoutFormProps {
  onSubmit: (email: string) => void;
}

function GuestCheckoutForm({ onSubmit }: GuestCheckoutFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="form-section">
        <h3 className="form-section-title">Guest Checkout</h3>

        <div className="form-group">
          <label className="form-label">
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <p
              style={{
                fontSize: '12px',
                color: 'var(--soo-red)',
                marginTop: '6px',
              }}
            >
              {error}
            </p>
          )}
          <p className="form-hint">
            We&apos;ll send your order confirmation and tracking info to this
            email.
          </p>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Continue to Payment
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

// Create account form
interface CreateAccountFormProps {
  onSubmit: (email: string, password: string) => void;
}

function CreateAccountForm({ onSubmit }: CreateAccountFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    onSubmit(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="form-card">
      <div className="form-section">
        <h3 className="form-section-title">Create Your Account</h3>

        <div className="form-group">
          <label className="form-label">
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            className="form-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Password <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Confirm Password <span className="required">*</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p
            style={{
              fontSize: '12px',
              color: 'var(--soo-red)',
              marginBottom: '16px',
            }}
          >
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
          Create Account & Continue
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

// Authenticated user checkout - skip options, show user info
interface AuthenticatedCheckoutProps {
  user: {
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  subtotal: number;
  onContinue: () => void;
}

function AuthenticatedCheckout({
  user,
  subtotal,
  onContinue,
}: AuthenticatedCheckoutProps) {
  return (
    <div className="form-card">
      <div className="form-section">
        <h3 className="form-section-title">Welcome back!</h3>

        <div className="saved-card-option selected" style={{ cursor: 'default' }}>
          <div className="saved-card-radio" />
          <div className="saved-card-content">
            <div
              className="saved-card-brand"
              style={{
                background: 'var(--soo-cream)',
                color: 'var(--soo-dark)',
              }}
            >
              👤
            </div>
            <div className="saved-card-info">
              <div className="saved-card-number">
                {user.firstName} {user.lastName}
              </div>
              <div className="saved-card-exp">{user.email}</div>
            </div>
          </div>
        </div>

        <p
          style={{
            fontSize: '13px',
            color: 'var(--soo-text-muted)',
            marginBottom: '20px',
          }}
        >
          You&apos;re signed in. Continue to payment to complete your order.
        </p>

        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={onContinue}
        >
          Continue to Payment
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
