'use client'

import { useState } from 'react'
import { WizardProgress, WizardFooter } from '@/components/wizard'
import styles from './page.module.css'

type PaymentMethod = 'card' | 'invoice' | 'apple'

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [useSavedCard, setUseSavedCard] = useState(true)
  const [agreedToTerms, setAgreedToTerms] = useState(true)

  // Mock values
  const subtotal = 968.20
  const delivery = 0
  const tax = 79.88
  const total = subtotal + delivery + tax

  return (
    <>
      <WizardProgress currentStep={6} />
      
      <main className={styles.content}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Complete Your Order</h1>
            <p>Review your order and enter payment details to confirm your reservation.</p>
          </div>

          <div className={styles.layout}>
            <div className={styles.mainColumn}>
              {/* Payment Method */}
              <div className={styles.formCard}>
                <h3 className={styles.cardTitle}>Payment Method</h3>

                <div className={styles.paymentMethods}>
                  <button
                    className={`${styles.methodBtn} ${paymentMethod === 'card' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <span className={styles.methodIcon}>💳</span>
                    <span className={styles.methodLabel}>Credit Card</span>
                    <span className={styles.methodDesc}>Visa, Mastercard, Amex</span>
                  </button>
                  <button
                    className={`${styles.methodBtn} ${paymentMethod === 'invoice' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('invoice')}
                  >
                    <span className={styles.methodIcon}>🏢</span>
                    <span className={styles.methodLabel}>Invoice</span>
                    <span className={styles.methodDesc}>Net 30 terms</span>
                  </button>
                  <button
                    className={`${styles.methodBtn} ${paymentMethod === 'apple' ? styles.selected : ''}`}
                    onClick={() => setPaymentMethod('apple')}
                  >
                    <span className={styles.methodIcon}>📱</span>
                    <span className={styles.methodLabel}>Apple Pay</span>
                    <span className={styles.methodDesc}>Quick checkout</span>
                  </button>
                </div>

                {paymentMethod === 'card' && (
                  <>
                    {/* Saved Card */}
                    <label 
                      className={`${styles.savedCard} ${useSavedCard ? styles.selected : ''}`}
                      onClick={() => setUseSavedCard(true)}
                    >
                      <div className={styles.radioCircle}>
                        {useSavedCard && <div className={styles.radioDot} />}
                      </div>
                      <div className={styles.cardBrand}>VISA</div>
                      <div className={styles.cardInfo}>
                        <div className={styles.cardNumber}>•••• •••• •••• 4242</div>
                        <div className={styles.cardExp}>Expires 08/27</div>
                      </div>
                    </label>

                    <div className={styles.orDivider}>
                      <span>or use a different card</span>
                    </div>

                    <div className={styles.cardForm} onClick={() => setUseSavedCard(false)}>
                      <div className={styles.formGroup}>
                        <label className="form-label">Cardholder Name <span className="required">*</span></label>
                        <input 
                          type="text" 
                          className="form-input" 
                          placeholder="Name as it appears on card"
                          disabled={useSavedCard}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className="form-label">Card Number <span className="required">*</span></label>
                        <div className={styles.cardInputWrapper}>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="1234 5678 9012 3456"
                            disabled={useSavedCard}
                          />
                          <div className={styles.cardIcons}>
                            <span className={styles.cardIconBadge}>VISA</span>
                            <span className={styles.cardIconBadge}>MC</span>
                            <span className={styles.cardIconBadge}>AMEX</span>
                          </div>
                        </div>
                      </div>

                      <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                          <label className="form-label">Expiry Month <span className="required">*</span></label>
                          <select className="form-input form-select" disabled={useSavedCard}>
                            <option value="">MM</option>
                            {[...Array(12)].map((_, i) => (
                              <option key={i} value={String(i + 1).padStart(2, '0')}>
                                {String(i + 1).padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label className="form-label">Expiry Year <span className="required">*</span></label>
                          <select className="form-input form-select" disabled={useSavedCard}>
                            <option value="">YYYY</option>
                            {[2026, 2027, 2028, 2029, 2030].map(year => (
                              <option key={year} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label className="form-label">CVV <span className="required">*</span></label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="123"
                            maxLength={4}
                            disabled={useSavedCard}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.securityBadge}>
                      <span className={styles.securityIcon}>🔒</span>
                      <span>
                        <strong>Secure Payment</strong> — Your card information is encrypted with 256-bit SSL
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Billing Address */}
              <div className={styles.formCard}>
                <h3 className={styles.cardTitle}>Billing Address</h3>
                <label className={`${styles.savedCard} ${styles.selected}`}>
                  <div className={styles.radioCircle}>
                    <div className={styles.radioDot} />
                  </div>
                  <div className={styles.addressInfo}>
                    <strong>Same as delivery address</strong>
                    <span>312 Pearl Parkway, Suite 500, San Antonio, TX 78215</span>
                  </div>
                </label>
              </div>

              {/* Promo Code */}
              <div className={styles.formCard}>
                <h3 className={styles.cardTitle}>Promo Code</h3>
                <div className={styles.promoRow}>
                  <div className={styles.formGroup} style={{ flex: 1, marginBottom: 0 }}>
                    <label className="form-label">Have a promo code?</label>
                    <input type="text" className="form-input" placeholder="Enter code" />
                  </div>
                  <button className={styles.applyBtn}>Apply</button>
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

                <div className={styles.summaryDetails}>
                  <div className={styles.detailRow}>
                    <span>Delivery Date</span>
                    <span>Feb 15, 2026</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Delivery Time</span>
                    <span>8:00 AM</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Location</span>
                    <span>312 Pearl Parkway</span>
                  </div>
                </div>

                <div className={styles.summaryItems}>
                  <div className={styles.itemsHeader}>
                    <span>Order Items</span>
                    <button className={styles.viewDetails}>View Details</button>
                  </div>
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
                    <span>FREE</span>
                  </div>
                  <div className={styles.calcRow}>
                    <span>Tax (8.25%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.summaryTotal}>
                  <span>Total</span>
                  <span className={styles.totalAmount}>${total.toFixed(2)}</span>
                </div>

                <label className={styles.termsCheckbox}>
                  <input 
                    type="checkbox" 
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <span>
                    I agree to the <a href="#">Terms of Service</a> and <a href="#">Cancellation Policy</a>. 
                    I understand that orders cancelled within 24 hours of delivery may be subject to a fee.
                  </span>
                </label>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <WizardFooter 
        currentStep={6}
        nextLabel={`Place Order — $${total.toFixed(2)}`}
        nextDisabled={!agreedToTerms}
        summaryItems={[
          { label: 'Order Total', value: `$${total.toFixed(2)}` },
        ]}
      />
    </>
  )
}
