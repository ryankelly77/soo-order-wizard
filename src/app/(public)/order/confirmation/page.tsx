'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const RESTAURANTS = [
  {
    id: 'southerleigh',
    name: 'Southerleigh Fine Food & Brewery',
    description: 'Texas comfort cuisine and craft beer in the historic Pearl Brewery building.',
    cuisine: 'Texas Comfort • Brewery',
    image: '/images/restaurants/southerleigh-inside.jpg',
    offer: '15% off your party when you mention your SOO catering order',
    offerCode: 'SOOCATERING15',
    rating: 4.7,
    priceRange: '$$',
    reservationUrl: 'https://www.opentable.com/southerleigh',
  },
  {
    id: 'mon-chou-chou',
    name: 'Mon Chou Chou',
    description: 'French brasserie bringing Parisian charm to the Pearl with classic dishes and wines.',
    cuisine: 'French Brasserie',
    image: '/images/restaurants/mon chou chou.jpeg',
    offer: 'Complimentary dessert for tables of 4+',
    offerCode: 'SOODESSERT',
    rating: 4.8,
    priceRange: '$$$',
    reservationUrl: 'https://www.opentable.com/mon-chou-chou',
  },
  {
    id: 'boilerhouse',
    name: 'Boiler House Texas Grill & Wine Garden',
    description: 'Upscale Texas grill featuring prime steaks, craft cocktails, and an extensive wine list.',
    cuisine: 'Steakhouse • Wine Bar',
    image: '/images/restaurants/boilerhouse.jpeg',
    offer: 'Free appetizer with any entree purchase',
    offerCode: 'SOOAPPETIZER',
    rating: 4.6,
    priceRange: '$$$',
    reservationUrl: 'https://www.opentable.com/boilerhouse',
  },
];

export default function OrderConfirmationPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mock order data - would come from order context/params in real app
  const orderData = {
    orderNumber: 'SOO-2026-1847',
    eventName: 'Q1 Strategy Meeting',
    eventDate: 'January 25, 2026',
    eventTime: '9:00 AM',
    deliveryAddress: '312 Pearl Parkway, Suite 500, San Antonio, TX 78215',
    estimatedDelivery: '8:30 AM',
    total: 1396.64,
    driverName: 'Marcus R.',
    driverPhone: '(210) 555-0147',
  };

  // Format currency with commas
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="confirmation-page">
      {/* Success Header */}
      <div className="confirmation-header">
        <div className="confirmation-success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 4L12 14.01l-3-3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-subtitle">
          Thank you for your order. We&apos;re preparing your catering and will have it ready for delivery.
        </p>
        <div className="order-number-badge">
          Order #{orderData.orderNumber}
        </div>
      </div>

      {/* Main Content */}
      <div className="confirmation-content">
        {/* Left Column - Tracking */}
        <div className="confirmation-tracking">
          {/* Order Summary Card */}
          <div className="tracking-summary-card">
            <h3>Order Details</h3>
            <div className="tracking-details">
              <div className="tracking-detail-row">
                <span className="tracking-label">Event</span>
                <span className="tracking-value">{orderData.eventName}</span>
              </div>
              <div className="tracking-detail-row">
                <span className="tracking-label">Date</span>
                <span className="tracking-value">{orderData.eventDate} at {orderData.eventTime}</span>
              </div>
              <div className="tracking-detail-row">
                <span className="tracking-label">Delivery To</span>
                <span className="tracking-value">{orderData.deliveryAddress}</span>
              </div>
              <div className="tracking-detail-row">
                <span className="tracking-label">Est. Arrival</span>
                <span className="tracking-value highlight">{orderData.estimatedDelivery}</span>
              </div>
              <div className="tracking-detail-row">
                <span className="tracking-label">Total</span>
                <span className="tracking-value">${formatCurrency(orderData.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipday Map Placeholder */}
          <div className="tracking-map-card">
            <div className="tracking-map-header">
              <h3>Live Delivery Tracking</h3>
              <span className="tracking-status preparing">Preparing Your Order</span>
            </div>
            <div className="tracking-map-container">
              {/* Shipday embed would go here */}
              <div className="tracking-map-placeholder">
                <div className="map-placeholder-content">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p>Live tracking will be available once your order is out for delivery</p>
                  <span className="map-eta">Estimated delivery: {orderData.estimatedDelivery}</span>
                </div>
              </div>

              {/* Driver Info */}
              <div className="driver-info">
                <div className="driver-avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="driver-details">
                  <span className="driver-name">{orderData.driverName}</span>
                  <span className="driver-role">Your Delivery Driver</span>
                </div>
                <a href={`tel:${orderData.driverPhone}`} className="driver-call-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Call
                </a>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="tracking-timeline">
              <div className="timeline-step completed">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Order Confirmed</span>
                  <span className="timeline-time">Just now</span>
                </div>
              </div>
              <div className="timeline-step active">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Preparing</span>
                  <span className="timeline-time">In progress</span>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Out for Delivery</span>
                  <span className="timeline-time">Pending</span>
                </div>
              </div>
              <div className="timeline-step">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <span className="timeline-title">Delivered</span>
                  <span className="timeline-time">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Restaurant Upsell */}
        <div className="confirmation-upsell">
          <div className="upsell-card">
            <div className="upsell-header">
              <h3>Complete Your Day at The Pearl</h3>
              <p>Book dinner for your team at one of our partner restaurants and enjoy exclusive offers.</p>
            </div>

            <div className="restaurant-offers">
              {RESTAURANTS.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className={`restaurant-offer-card ${selectedRestaurant === restaurant.id ? 'selected' : ''}`}
                  onClick={() => setSelectedRestaurant(restaurant.id)}
                >
                  <div className="restaurant-image">
                    {restaurant.image ? (
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="restaurant-image-actual"
                      />
                    ) : (
                      <div className="restaurant-image-placeholder">
                        <span>{restaurant.name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="restaurant-rating">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      {restaurant.rating}
                    </div>
                  </div>

                  <div className="restaurant-content">
                    <div className="restaurant-header">
                      <h4>{restaurant.name}</h4>
                      <span className="restaurant-price">{restaurant.priceRange}</span>
                    </div>
                    <span className="restaurant-cuisine">{restaurant.cuisine}</span>
                    <p className="restaurant-description">{restaurant.description}</p>

                    <div className="restaurant-offer">
                      <div className="offer-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="7" y1="7" x2="7.01" y2="7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Exclusive Offer
                      </div>
                      <p className="offer-text">{restaurant.offer}</p>
                      <span className="offer-code">Use code: {restaurant.offerCode}</span>
                    </div>

                    <a
                      href={restaurant.reservationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-reserve"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Reserve a Table
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="upsell-footer">
              <p>All restaurants are located at The Pearl, San Antonio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="confirmation-actions">
        <Link href="/orders" className="btn-secondary">
          View All Orders
        </Link>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
