'use client';

import { useState } from 'react';
import { isValidZipCode, isValidState } from '@/lib/utils/validation';
import type { DeliveryInfo } from '@/contracts/types';

interface DeliveryFormProps {
  values: Partial<DeliveryInfo>;
  onChange: (values: Partial<DeliveryInfo>) => void;
  eventTime?: string; // e.g., "9:00 AM"
  hasBreakfast?: boolean;
  hasLunch?: boolean;
}

interface SavedAddress {
  id: string;
  label: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
];

// Mock saved addresses - in real app, would come from user profile
const SAVED_ADDRESSES: SavedAddress[] = [
  {
    id: 'default',
    label: 'Pearl Brewery Office',
    address: '312 Pearl Parkway',
    addressLine2: 'Suite 500',
    city: 'San Antonio',
    state: 'TX',
    zipCode: '78215',
    isDefault: true,
  },
];

export function DeliveryForm({ values, onChange, eventTime = '9:00 AM', hasBreakfast = true, hasLunch = true }: DeliveryFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useSavedAddress, setUseSavedAddress] = useState<string | null>(
    SAVED_ADDRESSES.length > 0 ? SAVED_ADDRESSES[0].id : null
  );
  const [showCustomBreakfastTime, setShowCustomBreakfastTime] = useState(false);
  const [showCustomLunchTime, setShowCustomLunchTime] = useState(false);

  // Determine if we need two delivery times
  const needsTwoDeliveryTimes = hasBreakfast && hasLunch;

  // Generate time slots for breakfast (early morning)
  const generateBreakfastTimeSlots = () => {
    return [
      { time: '7:00 AM', note: 'Early setup' },
      { time: '7:30 AM', note: 'Recommended', recommended: true },
      { time: '8:00 AM', note: 'Standard' },
      { time: 'Custom', note: 'Set time', isCustom: true },
    ];
  };

  // Generate time slots for lunch
  const generateLunchTimeSlots = () => {
    return [
      { time: '11:00 AM', note: 'Early setup' },
      { time: '11:30 AM', note: 'Recommended', recommended: true },
      { time: '12:00 PM', note: 'Standard' },
      { time: 'Custom', note: 'Set time', isCustom: true },
    ];
  };

  // Generate generic time slots based on event time (fallback)
  const generateGenericTimeSlots = () => {
    const eventHour = parseInt(eventTime.split(':')[0]);
    const isPM = eventTime.includes('PM');
    const hour24 = isPM && eventHour !== 12 ? eventHour + 12 : eventHour;

    return [
      { time: formatTime(hour24 - 1.5), note: '90 min early' },
      { time: formatTime(hour24 - 1), note: 'Recommended', recommended: true },
      { time: formatTime(hour24 - 0.5), note: '30 min early' },
      { time: 'Custom', note: 'Set time', isCustom: true },
    ];
  };

  const formatTime = (hour24: number) => {
    const hour = hour24 % 12 || 12;
    const minutes = (hour24 % 1) * 60;
    const ampm = hour24 < 12 ? 'AM' : 'PM';
    return `${hour}:${minutes === 0 ? '00' : '30'} ${ampm}`;
  };

  const breakfastTimeSlots = generateBreakfastTimeSlots();
  const lunchTimeSlots = generateLunchTimeSlots();
  const genericTimeSlots = generateGenericTimeSlots();

  const handleChange = (field: keyof DeliveryInfo, value: string) => {
    onChange({ ...values, [field]: value });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateField = (field: keyof DeliveryInfo, value: string) => {
    let error = '';
    switch (field) {
      case 'zipCode':
        if (value && !isValidZipCode(value)) {
          error = 'Please enter a valid ZIP code';
        }
        break;
      case 'state':
        if (value && !isValidState(value)) {
          error = 'Please select a valid state';
        }
        break;
    }
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSavedAddressSelect = (addressId: string) => {
    setUseSavedAddress(addressId);
    const address = SAVED_ADDRESSES.find((a) => a.id === addressId);
    if (address) {
      onChange({
        ...values,
        address: address.address,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
      });
    }
  };

  const handleBreakfastTimeSlotSelect = (slot: { time: string; isCustom?: boolean }) => {
    if (slot.isCustom) {
      setShowCustomBreakfastTime(true);
    } else {
      setShowCustomBreakfastTime(false);
      onChange({ ...values, breakfastDeliveryTime: slot.time });
    }
  };

  const handleLunchTimeSlotSelect = (slot: { time: string; isCustom?: boolean }) => {
    if (slot.isCustom) {
      setShowCustomLunchTime(true);
    } else {
      setShowCustomLunchTime(false);
      onChange({ ...values, lunchDeliveryTime: slot.time });
    }
  };

  const handleSingleTimeSlotSelect = (slot: { time: string; isCustom?: boolean }) => {
    if (slot.isCustom) {
      setShowCustomBreakfastTime(true);
    } else {
      setShowCustomBreakfastTime(false);
      handleChange('preferredDeliveryTime', slot.time);
    }
  };

  return (
    <div className="form-card">
      {/* Delivery Time Section */}
      {needsTwoDeliveryTimes ? (
        <>
          {/* Breakfast Delivery Time */}
          <div className="form-section">
            <h3 className="form-section-title">Breakfast Delivery Time</h3>
            <p className="delivery-time-hint">
              When should we deliver breakfast? We recommend arriving 30 minutes before your event starts.
            </p>

            <div className="time-slots">
              {breakfastTimeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`time-slot ${
                    values.breakfastDeliveryTime === slot.time ? 'selected' : ''
                  } ${slot.recommended ? 'recommended' : ''}`}
                  onClick={() => handleBreakfastTimeSlotSelect(slot)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleBreakfastTimeSlotSelect(slot);
                    }
                  }}
                >
                  <div className="time-slot-time">{slot.time}</div>
                  <div className="time-slot-note">{slot.note}</div>
                </div>
              ))}
            </div>

            {showCustomBreakfastTime && (
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Custom Breakfast Delivery Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={values.breakfastDeliveryTime || ''}
                  onChange={(e) => onChange({ ...values, breakfastDeliveryTime: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Lunch Delivery Time */}
          <div className="form-section">
            <h3 className="form-section-title">Lunch Delivery Time</h3>
            <p className="delivery-time-hint">
              When should we deliver lunch? We recommend arriving 30 minutes before lunch service.
            </p>

            <div className="time-slots">
              {lunchTimeSlots.map((slot) => (
                <div
                  key={slot.time}
                  className={`time-slot ${
                    values.lunchDeliveryTime === slot.time ? 'selected' : ''
                  } ${slot.recommended ? 'recommended' : ''}`}
                  onClick={() => handleLunchTimeSlotSelect(slot)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleLunchTimeSlotSelect(slot);
                    }
                  }}
                >
                  <div className="time-slot-time">{slot.time}</div>
                  <div className="time-slot-note">{slot.note}</div>
                </div>
              ))}
            </div>

            {showCustomLunchTime && (
              <div className="form-group" style={{ marginTop: '16px' }}>
                <label className="form-label">Custom Lunch Delivery Time</label>
                <input
                  type="time"
                  className="form-input"
                  value={values.lunchDeliveryTime || ''}
                  onChange={(e) => onChange({ ...values, lunchDeliveryTime: e.target.value })}
                />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="form-section">
          <h3 className="form-section-title">Preferred Delivery Time</h3>
          <p className="delivery-time-hint">
            Your event starts at <strong>{eventTime}</strong>. We recommend delivery 30-60 minutes before.
          </p>

          <div className="time-slots">
            {(hasBreakfast ? breakfastTimeSlots : hasLunch ? lunchTimeSlots : genericTimeSlots).map((slot) => (
              <div
                key={slot.time}
                className={`time-slot ${
                  values.preferredDeliveryTime === slot.time ? 'selected' : ''
                } ${slot.recommended ? 'recommended' : ''}`}
                onClick={() => handleSingleTimeSlotSelect(slot)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSingleTimeSlotSelect(slot);
                  }
                }}
              >
                <div className="time-slot-time">{slot.time}</div>
                <div className="time-slot-note">{slot.note}</div>
              </div>
            ))}
          </div>

          {showCustomBreakfastTime && (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Custom Time</label>
              <input
                type="time"
                className="form-input"
                value={values.preferredDeliveryTime || ''}
                onChange={(e) => handleChange('preferredDeliveryTime', e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {/* Delivery Address Section */}
      <div className="form-section">
        <h3 className="form-section-title">Delivery Address</h3>

        {/* Saved Addresses */}
        {SAVED_ADDRESSES.map((address) => (
          <div
            key={address.id}
            className={`saved-address-option ${useSavedAddress === address.id ? 'selected' : ''}`}
            onClick={() => handleSavedAddressSelect(address.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSavedAddressSelect(address.id);
              }
            }}
          >
            <div className="saved-address-radio"></div>
            <div className="saved-address-content">
              <div className="saved-address-label">
                {address.label} {address.isDefault && '(Default)'}
              </div>
              <div className="saved-address-text">
                {address.address}
                {address.addressLine2 && `, ${address.addressLine2}`}, {address.city}, {address.state} {address.zipCode}
              </div>
            </div>
          </div>
        ))}

        <div className="or-divider">or enter a new address</div>

        <div className="form-group">
          <label className="form-label">
            Street Address <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            placeholder="123 Main Street"
            value={values.address || ''}
            onChange={(e) => {
              setUseSavedAddress(null);
              handleChange('address', e.target.value);
            }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Suite / Floor / Building</label>
          <input
            type="text"
            className="form-input"
            placeholder="Suite 500, 5th Floor"
            value={values.addressLine2 || ''}
            onChange={(e) => handleChange('addressLine2', e.target.value)}
          />
        </div>

        <div className="form-row three-col">
          <div className="form-group">
            <label className="form-label">
              City <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="San Antonio"
              value={values.city || ''}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              State <span className="required">*</span>
            </label>
            <select
              className="form-input form-select"
              value={values.state || ''}
              onChange={(e) => {
                handleChange('state', e.target.value);
                validateField('state', e.target.value);
              }}
            >
              <option value="">Select</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && <p className="form-error">{errors.state}</p>}
          </div>
          <div className="form-group">
            <label className="form-label">
              ZIP Code <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="78215"
              value={values.zipCode || ''}
              onChange={(e) => handleChange('zipCode', e.target.value)}
              onBlur={(e) => validateField('zipCode', e.target.value)}
            />
            {errors.zipCode && <p className="form-error">{errors.zipCode}</p>}
          </div>
        </div>
      </div>

      {/* Delivery Contact Section */}
      <div className="form-section">
        <h3 className="form-section-title">Delivery Contact</h3>
        <p className="form-hint" style={{ marginBottom: '16px' }}>
          This person will be contacted when the driver arrives.
        </p>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">
              Contact Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Sarah Johnson"
              value={values.contactName || ''}
              onChange={(e) => handleChange('contactName' as keyof DeliveryInfo, e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              className="form-input"
              placeholder="(210) 555-1234"
              value={values.contactPhone || ''}
              onChange={(e) => handleChange('contactPhone' as keyof DeliveryInfo, e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Delivery Instructions Section */}
      <div className="form-section">
        <h3 className="form-section-title">Delivery Instructions</h3>

        <div className="form-group">
          <label className="form-label">Special Instructions</label>
          <textarea
            className="form-input"
            placeholder="e.g., Use freight elevator, check in with security at front desk, deliver to Conference Room A..."
            rows={4}
            value={values.deliveryInstructions || ''}
            onChange={(e) => handleChange('deliveryInstructions', e.target.value)}
          />
          <p className="form-hint">Any details that will help our delivery team find you.</p>
        </div>
      </div>
    </div>
  );
}
