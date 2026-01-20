'use client';

import { useState, useEffect } from 'react';
import type { EventDetails } from '@/contracts/types';

interface EventDetailsFormProps {
  values: Partial<EventDetails>;
  onChange: (values: Partial<EventDetails>) => void;
}

const EVENT_TYPES = [
  { value: '', label: 'Select event type...' },
  { value: 'meeting', label: 'Business Meeting' },
  { value: 'conference', label: 'Conference' },
  { value: 'workshop', label: 'Workshop / Training' },
  { value: 'celebration', label: 'Celebration / Party' },
  { value: 'lunch-learn', label: 'Lunch & Learn' },
  { value: 'client-event', label: 'Client Event' },
  { value: 'team-building', label: 'Team Building' },
  { value: 'other', label: 'Other' },
];

export function EventDetailsForm({ values, onChange }: EventDetailsFormProps) {
  const [headCount, setHeadCount] = useState(values.headCount || 12);

  // Sync headCount with values prop
  useEffect(() => {
    if (values.headCount !== undefined && values.headCount !== headCount) {
      setHeadCount(values.headCount);
    }
  }, [values.headCount, headCount]);

  const handleHeadCountChange = (newCount: number) => {
    const clamped = Math.max(1, Math.min(100, newCount));
    setHeadCount(clamped);
    onChange({ ...values, headCount: clamped });
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

  // Get minimum date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="form-card">
      {/* Event Information Section */}
      <div className="form-section">
        <h3 className="form-section-title">Event Information</h3>

        <div className="form-group">
          <label className="form-label">
            Event Name <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Q1 Strategy Meeting, Board Presentation"
            value={values.eventName || ''}
            onChange={(e) => onChange({ ...values, eventName: e.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Event Date <span className="required">*</span>
            </label>
            <input
              type="date"
              className="form-input"
              min={minDate}
              value={formatDateForInput(values.eventDate)}
              onChange={(e) =>
                onChange({ ...values, eventDate: new Date(e.target.value) })
              }
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Event Time <span className="required">*</span>
            </label>
            <input
              type="time"
              className="form-input"
              value={values.eventTime || '09:00'}
              onChange={(e) => onChange({ ...values, eventTime: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      {/* Attendees Section */}
      <div className="form-section">
        <h3 className="form-section-title">Attendees</h3>

        <div className="form-group">
          <label className="form-label">
            Number of Attendees <span className="required">*</span>
          </label>
          <div className="number-stepper">
            <button
              type="button"
              className="stepper-btn"
              onClick={() => handleHeadCountChange(headCount - 1)}
              disabled={headCount <= 1}
              aria-label="Decrease attendees"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14" />
              </svg>
            </button>
            <input
              type="number"
              className="stepper-input"
              value={headCount}
              onChange={(e) => handleHeadCountChange(parseInt(e.target.value) || 1)}
              min={1}
              max={100}
            />
            <button
              type="button"
              className="stepper-btn"
              onClick={() => handleHeadCountChange(headCount + 1)}
              disabled={headCount >= 100}
              aria-label="Increase attendees"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>
          <p className="form-hint">Minimum 1, maximum 100 attendees per order</p>
        </div>
      </div>

      {/* Event Type Section */}
      <div className="form-section">
        <h3 className="form-section-title">Event Type</h3>

        <div className="form-group">
          <label className="form-label">What type of event is this?</label>
          <select
            className="form-input form-select"
            value={(values as Record<string, unknown>).eventType as string || ''}
            onChange={(e) =>
              onChange({ ...values, eventType: e.target.value } as Partial<EventDetails>)
            }
          >
            {EVENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Special Requirements or Notes</label>
          <textarea
            className="form-input form-textarea"
            placeholder="Any dietary restrictions for the group, special setup requirements, or other notes..."
            rows={4}
            value={values.specialRequests || ''}
            onChange={(e) =>
              onChange({ ...values, specialRequests: e.target.value })
            }
          />
        </div>
      </div>

      {/* Service Preference Section */}
      <div className="form-section">
        <h3 className="form-section-title">Service Preference</h3>
        <p className="form-section-desc">How would you like your catering delivered and set up?</p>

        <div className="service-preference-options">
          <label
            className={`service-option ${(values as Record<string, unknown>).servicePreference === 'dropoff' || !(values as Record<string, unknown>).servicePreference ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="servicePreference"
              value="dropoff"
              checked={(values as Record<string, unknown>).servicePreference === 'dropoff' || !(values as Record<string, unknown>).servicePreference}
              onChange={(e) =>
                onChange({ ...values, servicePreference: e.target.value } as Partial<EventDetails>)
              }
            />
            <div className="service-option-content">
              <div className="service-option-header">
                <span className="service-option-name">Drop Off Only</span>
                <span className="service-option-price">Included</span>
              </div>
              <p className="service-option-desc">
                Food delivered to your location. You handle setup and cleanup.
              </p>
            </div>
          </label>

          <label
            className={`service-option ${(values as Record<string, unknown>).servicePreference === 'setup' ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="servicePreference"
              value="setup"
              checked={(values as Record<string, unknown>).servicePreference === 'setup'}
              onChange={(e) =>
                onChange({ ...values, servicePreference: e.target.value } as Partial<EventDetails>)
              }
            />
            <div className="service-option-content">
              <div className="service-option-header">
                <span className="service-option-name">Full Setup</span>
                <span className="service-option-price">+10%</span>
              </div>
              <p className="service-option-desc">
                We set up your buffet, arrange the food beautifully, and leave it ready for your guests.
              </p>
            </div>
          </label>

          <label
            className={`service-option ${(values as Record<string, unknown>).servicePreference === 'staffed' ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name="servicePreference"
              value="staffed"
              checked={(values as Record<string, unknown>).servicePreference === 'staffed'}
              onChange={(e) =>
                onChange({ ...values, servicePreference: e.target.value } as Partial<EventDetails>)
              }
            />
            <div className="service-option-content">
              <div className="service-option-header">
                <span className="service-option-name">Staffed Service</span>
                <span className="service-option-price">+20%</span>
              </div>
              <p className="service-option-desc">
                Professional staff to serve your guests, replenish food, and handle cleanup.
              </p>
            </div>
          </label>
        </div>
      </div>

      {/* Info Callout */}
      <div className="info-callout">
        <div className="info-callout-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
          </svg>
        </div>
        <div className="info-callout-content">
          <strong>Shareable Lunch Links</strong>
          <p>
            When ordering lunch, you&apos;ll receive a unique link to share with
            your attendees. Each person can then select their own personalized
            lunch preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
