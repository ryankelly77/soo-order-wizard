'use client'

import { useState } from 'react'
import { WizardProgress, WizardFooter } from '@/components/wizard'
import styles from './page.module.css'

const SNACK_PACKAGES = [
  {
    id: 'premium',
    name: 'Premium Snack Spread',
    description: 'Gourmet selection for discerning tastes',
    price: 89,
    serves: '10-15',
    items: ['Artisan cheeses', 'Charcuterie', 'Fresh fruit', 'Gourmet crackers'],
  },
  {
    id: 'light',
    name: 'Light & Healthy',
    description: 'Nutritious options for health-conscious groups',
    price: 65,
    serves: '10-15',
    items: ['Veggie crudités', 'Hummus trio', 'Fresh fruit', 'Mixed nuts'],
  },
]

const BEVERAGE_PACKAGES = [
  {
    id: 'coffee',
    name: 'Coffee & Tea Service',
    description: 'Classic hot beverage station',
    price: 45,
    items: ['Premium coffee', 'Assorted teas', 'Cream & sugar'],
    icon: '☕',
  },
  {
    id: 'craft',
    name: 'Craft Beverages',
    description: 'Artisanal refreshments',
    price: 65,
    items: ['Cold brew', 'Sparkling water', 'Fresh lemonade'],
    icon: '🧃',
  },
  {
    id: 'premium-drinks',
    name: 'Premium Package',
    description: 'Full beverage experience',
    price: 95,
    items: ['Espresso bar', 'Craft sodas', 'Smoothie station'],
    icon: '🍹',
  },
]

export default function SnacksPage() {
  const [selectedSnack, setSelectedSnack] = useState<string | null>('premium')
  const [selectedBeverage, setSelectedBeverage] = useState<string | null>('craft')
  const [skipSnacks, setSkipSnacks] = useState(false)
  const [skipBeverages, setSkipBeverages] = useState(false)

  // Mock values - would come from context
  const breakfastTotal = 454.80
  const lunchTotal = 359.40

  const snackPrice = skipSnacks ? 0 : (SNACK_PACKAGES.find(p => p.id === selectedSnack)?.price || 0)
  const beveragePrice = skipBeverages ? 0 : (BEVERAGE_PACKAGES.find(p => p.id === selectedBeverage)?.price || 0)
  const subtotal = breakfastTotal + lunchTotal + snackPrice + beveragePrice

  return (
    <>
      <WizardProgress currentStep={4} />
      
      <main className={styles.content}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Snacks & Drinks</h1>
            <p>Add optional snacks and beverages to keep your team energized.</p>
          </div>

          <div className={styles.layout}>
            <div className={styles.mainColumn}>
              {/* Snack Packages */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Snack Packages</h2>
                  <span className={styles.optionalBadge}>Optional</span>
                </div>

                <div className={styles.snackGrid}>
                  {SNACK_PACKAGES.map(pkg => (
                    <div 
                      key={pkg.id}
                      className={`${styles.snackCard} ${selectedSnack === pkg.id && !skipSnacks ? styles.selected : ''} ${skipSnacks ? styles.disabled : ''}`}
                      onClick={() => !skipSnacks && setSelectedSnack(pkg.id)}
                    >
                      <div className={styles.snackImage}>🧀</div>
                      <div className={styles.snackContent}>
                        <h3 className={styles.snackName}>{pkg.name}</h3>
                        <p className={styles.snackDesc}>{pkg.description}</p>
                        <div className={styles.snackItems}>
                          {pkg.items.map((item, i) => (
                            <span key={i} className={styles.snackItem}>{item}</span>
                          ))}
                        </div>
                        <div className={styles.snackFooter}>
                          <span className={styles.snackPrice}>${pkg.price}</span>
                          <span className={styles.snackServes}>Serves {pkg.serves}</span>
                        </div>
                      </div>
                      {selectedSnack === pkg.id && !skipSnacks && (
                        <div className={styles.cardCheck}>✓</div>
                      )}
                    </div>
                  ))}
                </div>

                <label className={styles.skipOption}>
                  <input 
                    type="checkbox" 
                    checked={skipSnacks}
                    onChange={(e) => setSkipSnacks(e.target.checked)}
                  />
                  <span>Skip snacks for this event</span>
                </label>
              </section>

              {/* Beverage Packages */}
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>Beverage Packages</h2>
                  <span className={styles.optionalBadge}>Optional</span>
                </div>

                <div className={styles.beverageGrid}>
                  {BEVERAGE_PACKAGES.map(pkg => (
                    <div 
                      key={pkg.id}
                      className={`${styles.beverageCard} ${selectedBeverage === pkg.id && !skipBeverages ? styles.selected : ''} ${skipBeverages ? styles.disabled : ''}`}
                      onClick={() => !skipBeverages && setSelectedBeverage(pkg.id)}
                    >
                      <div className={`${styles.beverageIcon} ${selectedBeverage === pkg.id && !skipBeverages ? styles.selectedIcon : ''}`}>
                        {pkg.icon}
                        {selectedBeverage === pkg.id && !skipBeverages && (
                          <span className={styles.iconCheck}>✓</span>
                        )}
                      </div>
                      <h3 className={styles.beverageName}>{pkg.name}</h3>
                      <p className={styles.beverageDesc}>{pkg.description}</p>
                      <div className={styles.beverageItems}>
                        {pkg.items.map((item, i) => (
                          <span key={i} className={styles.beverageItem}>{item}</span>
                        ))}
                      </div>
                      <div className={styles.beveragePrice}>${pkg.price}</div>
                    </div>
                  ))}
                </div>

                <label className={styles.skipOption}>
                  <input 
                    type="checkbox" 
                    checked={skipBeverages}
                    onChange={(e) => setSkipBeverages(e.target.checked)}
                  />
                  <span>Skip beverages for this event</span>
                </label>
              </section>
            </div>

            {/* Order Summary Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                
                <div className={styles.summaryItems}>
                  <div className={styles.summaryItem}>
                    <span>Breakfast</span>
                    <span>${breakfastTotal.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Lunch</span>
                    <span>${lunchTotal.toFixed(2)}</span>
                  </div>
                  {!skipSnacks && snackPrice > 0 && (
                    <div className={styles.summaryItem}>
                      <span>Snacks</span>
                      <span>${snackPrice.toFixed(2)}</span>
                    </div>
                  )}
                  {!skipBeverages && beveragePrice > 0 && (
                    <div className={styles.summaryItem}>
                      <span>Beverages</span>
                      <span>${beveragePrice.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className={styles.summaryTotal}>
                  <span>Subtotal</span>
                  <span className={styles.totalAmount}>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <WizardFooter 
        currentStep={4}
        summaryItems={[
          { label: 'Snacks', value: skipSnacks ? 'Skipped' : `$${snackPrice}` },
          { label: 'Drinks', value: skipBeverages ? 'Skipped' : `$${beveragePrice}` },
          { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
        ]}
      />
    </>
  )
}
