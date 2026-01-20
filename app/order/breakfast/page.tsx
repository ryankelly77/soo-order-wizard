'use client'

import { useState } from 'react'
import { WizardProgress, WizardFooter } from '@/components/wizard'
import styles from './page.module.css'

const PACKAGES = [
  {
    id: 'continental',
    name: 'Continental Classic',
    description: 'Light and refreshing start to your morning',
    price: 18.95,
    items: ['Fresh pastries', 'Seasonal fruit', 'Yogurt parfaits', 'Coffee & tea'],
    badges: ['V'],
  },
  {
    id: 'executive',
    name: 'Executive Brunch',
    description: 'Our most popular full breakfast experience',
    price: 32.95,
    items: ['Eggs benedict', 'Bacon & sausage', 'French toast', 'Fresh fruit', 'Pastries', 'Coffee & tea'],
    badges: ['GF options'],
    popular: true,
  },
  {
    id: 'health',
    name: 'Health & Vitality',
    description: 'Nutritious options to fuel your day',
    price: 26.95,
    items: ['Avocado toast', 'Egg white frittata', 'Acai bowls', 'Fresh pressed juice'],
    badges: ['V', 'GF'],
  },
]

const ADDONS = [
  { id: 'espresso', name: 'Espresso Bar', price: 4.95, emoji: '☕' },
  { id: 'juice', name: 'Fresh Juice Station', price: 5.95, emoji: '🍊' },
  { id: 'bacon', name: 'Bacon & Sausage', price: 4.50, emoji: '🥓' },
  { id: 'waffle', name: 'Waffle Station', price: 6.95, emoji: '🧇' },
]

export default function BreakfastPage() {
  const [selectedPackage, setSelectedPackage] = useState('executive')
  const [selectedAddons, setSelectedAddons] = useState(['espresso'])
  const attendees = 12 // Would come from state/context

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const selectedPkg = PACKAGES.find(p => p.id === selectedPackage)
  const packageTotal = (selectedPkg?.price || 0) * attendees
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = ADDONS.find(a => a.id === id)
    return sum + (addon?.price || 0) * attendees
  }, 0)
  const subtotal = packageTotal + addonsTotal

  return (
    <>
      <WizardProgress currentStep={2} />
      
      <main className={styles.content}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Breakfast Selection</h1>
            <p>Choose a breakfast package for your {attendees} attendees.</p>
          </div>

          <div className={styles.layout}>
            <div className={styles.mainColumn}>
              {/* Package Selection */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Choose Your Package</h2>
                <div className={styles.packageGrid}>
                  {PACKAGES.map(pkg => (
                    <div 
                      key={pkg.id}
                      className={`${styles.packageCard} ${selectedPackage === pkg.id ? styles.selected : ''}`}
                      onClick={() => setSelectedPackage(pkg.id)}
                    >
                      {pkg.popular && <div className={styles.popularBadge}>Most Popular</div>}
                      {selectedPackage === pkg.id && <div className={styles.checkmark}>✓</div>}
                      
                      <div className={styles.packageImage}>
                        <span className={styles.imagePlaceholder}>🍳</span>
                      </div>
                      
                      <div className={styles.packageContent}>
                        <h3 className={styles.packageName}>{pkg.name}</h3>
                        <p className={styles.packageDesc}>{pkg.description}</p>
                        
                        <ul className={styles.packageItems}>
                          {pkg.items.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                        
                        <div className={styles.packageFooter}>
                          <div className={styles.packagePrice}>
                            <span className={styles.priceAmount}>${pkg.price.toFixed(2)}</span>
                            <span className={styles.pricePer}>per person</span>
                          </div>
                          <div className={styles.packageBadges}>
                            {pkg.badges.map((badge, i) => (
                              <span key={i} className="dietary-badge">{badge}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Add-ons */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Optional Add-ons</h2>
                <div className={styles.addonsGrid}>
                  {ADDONS.map(addon => (
                    <div 
                      key={addon.id}
                      className={`${styles.addonCard} ${selectedAddons.includes(addon.id) ? styles.selected : ''}`}
                      onClick={() => toggleAddon(addon.id)}
                    >
                      <div className={styles.addonIcon}>{addon.emoji}</div>
                      <div className={styles.addonInfo}>
                        <h4 className={styles.addonName}>{addon.name}</h4>
                        <p className={styles.addonPrice}>+${addon.price.toFixed(2)} / person</p>
                      </div>
                      <div className={styles.addonCheck}>
                        {selectedAddons.includes(addon.id) ? '✓' : '+'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Order Summary Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.summaryCard}>
                <h3 className={styles.summaryTitle}>Order Summary</h3>
                
                <div className={styles.summaryEvent}>
                  <div className={styles.summaryEventIcon}>📅</div>
                  <div>
                    <h4>Q1 Strategy Meeting</h4>
                    <p>Feb 15, 2026 • {attendees} attendees</p>
                  </div>
                </div>

                <div className={styles.summaryItems}>
                  <div className={styles.summaryItem}>
                    <span>{selectedPkg?.name} × {attendees}</span>
                    <span>${packageTotal.toFixed(2)}</span>
                  </div>
                  {selectedAddons.map(id => {
                    const addon = ADDONS.find(a => a.id === id)
                    if (!addon) return null
                    return (
                      <div key={id} className={styles.summaryItem}>
                        <span>{addon.name} × {attendees}</span>
                        <span>${(addon.price * attendees).toFixed(2)}</span>
                      </div>
                    )
                  })}
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
        currentStep={2}
        summaryItems={[
          { label: 'Attendees', value: String(attendees) },
          { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
        ]}
      />
    </>
  )
}
