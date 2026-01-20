'use client'

import { useState } from 'react'
import { WizardProgress, WizardFooter } from '@/components/wizard'
import styles from './page.module.css'

const TIME_SLOTS = [
  { id: '7:30', label: '7:30 AM', recommended: false },
  { id: '8:00', label: '8:00 AM', recommended: true },
  { id: '8:30', label: '8:30 AM', recommended: false },
  { id: 'custom', label: 'Custom', recommended: false },
]

export default function DeliveryPage() {
  const [selectedTime, setSelectedTime] = useState('8:00')
  const [useSavedAddress, setUseSavedAddress] = useState(true)

  // Mock values
  const subtotal = 968.20
  const delivery = 0 // Free for orders over $500
  const tax = subtotal * 0.0825
  const total = subtotal + delivery + tax

  return (
    <>
      <WizardProgress currentStep={5} />
      
      <main className={styles.content}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Delivery Details</h1>
            <p>Tell us where and when to deliver your catering order.</p>
          </div>

          <div className={styles.layout}>
            <div className={styles.mainColumn}>
              {/* Delivery Time */}
              <div className={styles.formCard}>
                <h3 className={styles.cardTitle}>Preferred Delivery Time</h3>
                <p className={styles.cardSubtitle}>We recommend delivery 30 minutes before your event starts.</p>

                <div className={styles.timeSlots}>
                  {TIME_SLOTS.map(slot => (
                    <button
                      key={slot.id}
                      className={`${styles.timeSlot} ${selectedTime === slot.id ? styles.selected : ''}`}
                      onClick={() => setSelectedTime(slot.id)}
                    >
                      <span className={styles.timeLabel}>{slot.label}</span>
                      {slot.recommended && <span className={styles.recommended}>Recommended</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className={styles.formCard}>
                <h3 className={styles.cardTitle}>Delivery Address</h3>

                <label 
                  className={`${styles.savedAddress} ${useSavedAddress ? styles.selected : ''}`}
                  onClick={() => setUseSavedAddress(true)}
                >
                  <div className={styles.radioCircle}>
                    {useSavedAddress && <div className={styles.radioDot} />}
                  </div>
                  <div className={styles.addressInfo}>
                    <strong>Pearl Brewery Office</strong>
                    <span>312 Pearl Parkway, Suite 500, San Antonio, TX 78215</span>
                  </div>
                </label>

                <div className={styles.orDivider}>
                  <span>or enter a new address</span>
                </div>

                <div className={styles.addressForm}>
                  <div className={styles.formGroup}>
                    <label className="form-label">Street Address</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="123 Main Street"
                      disabled={useSavedAddress}
                      onFocus={() => setUseSavedAddress(false)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className="form-label">Suite / Floor / Building</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="Suite 100"
                      disabled={useSavedAddress}
                      onFocus={() => setUseSavedAddress(false)}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className="form-label">City</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="San Antonio"
                        disabled={useSavedAddress}
                        onFocus={() => setUseSavedAddress(false)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className="form-label">State</label>
                      <select 
                        className="form-input form-select"
                        disabled={useSavedAddress}
                        onFocus={() => setUseSavedAddress(false)}
                      >
                        <option value="">Select...</option>
                        <option value="TX">Texas</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className="form-label">ZIP Code</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="78215"
                        disabled={useSavedAddress}
                        onFocus={() => setUseSavedAddress(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Contact */}
              <div className={styles.formCard}>
                <h3 className={styles.cardTitle}>Delivery Contact</h3>
                <p className={styles.cardSubtitle}>Who should our team contact upon arrival?</p>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className="form-label">Contact Name <span className="required">*</span></label>
                    <input 
                      type="text" 
                      className="form-input" 
                      defaultValue="Sarah Johnson"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className="form-label">Phone Number <span className="required">*</span></label>
                    <input 
                      type="tel" 
                      className="form-input" 
                      defaultValue="(210) 555-1234"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className="form-label">Special Delivery Instructions</label>
                  <textarea 
                    className="form-input"
                    rows={3}
                    placeholder="e.g., Use the service elevator, check in with front desk..."
                  />
                </div>
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                
                <div className={styles.summaryEvent}>
                  <div className={styles.summaryEventIcon}>📅</div>
                  <div>
                    <h4>Q1 Strategy Meeting</h4>
                    <p>Feb 15, 2026 • 12 attendees</p>
                  </div>
                </div>

                <div className={styles.summaryItems}>
                  <div className={styles.summaryItem}>
                    <span>Executive Brunch × 12</span>
                    <span>$395.40</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Espresso Bar × 12</span>
                    <span>$59.40</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Lunch Selections × 12</span>
                    <span>$359.40</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Premium Snack Spread</span>
                    <span>$89.00</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Craft Beverages</span>
                    <span>$65.00</span>
                  </div>
                </div>

                <div className={styles.summaryCalculations}>
                  <div className={styles.calcRow}>
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Delivery</span>
                    <span className={styles.freeDelivery}>FREE</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Est. Tax (8.25%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span className={styles.totalAmount}>${total.toFixed(2)}</span>
                </div>

                <div className={styles.deliveryInfo}>
                  <span className={styles.infoIcon}>🚚</span>
                  <span>Free delivery on orders over $500</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <WizardFooter 
        currentStep={5}
        summaryItems={[
          { label: 'Delivery', value: selectedTime === 'custom' ? 'Custom' : `${selectedTime} AM` },
          { label: 'Total', value: `$${total.toFixed(2)}` },
        ]}
      />
    </>
  )
}
