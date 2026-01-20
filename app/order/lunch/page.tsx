'use client'

import { useState } from 'react'
import { WizardProgress, WizardFooter } from '@/components/wizard'
import styles from './page.module.css'

interface Attendee {
  id: number
  name: string
  email: string
  filled: boolean
}

const INITIAL_ATTENDEES: Attendee[] = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah.johnson@company.com', filled: true },
  { id: 2, name: 'Michael Chen', email: 'michael.chen@company.com', filled: true },
  { id: 3, name: 'Emily Rodriguez', email: 'emily.r@company.com', filled: true },
  { id: 4, name: '', email: '', filled: false },
  { id: 5, name: '', email: '', filled: false },
  { id: 6, name: '', email: '', filled: false },
  { id: 7, name: '', email: '', filled: false },
  { id: 8, name: '', email: '', filled: false },
  { id: 9, name: '', email: '', filled: false },
  { id: 10, name: '', email: '', filled: false },
  { id: 11, name: '', email: '', filled: false },
  { id: 12, name: '', email: '', filled: false },
]

const MENU_ITEMS = {
  entrees: [
    { name: 'Grilled Atlantic Salmon', desc: 'Lemon herb butter, capers', badges: ['GF'] },
    { name: 'Chicken Marsala', desc: 'Mushroom wine sauce', badges: [] },
    { name: 'Filet Mignon', desc: 'Red wine reduction', badges: ['GF'] },
    { name: 'Vegetable Wellington', desc: 'Puff pastry, seasonal vegetables', badges: ['V', 'VG'] },
  ],
  sides: [
    { name: 'Garlic Mashed Potatoes', desc: 'Roasted garlic, cream', badges: ['GF', 'V'] },
    { name: 'Wild Rice Pilaf', desc: 'Herbs, toasted almonds', badges: ['GF', 'VG'] },
    { name: 'Roasted Vegetables', desc: 'Seasonal selection', badges: ['GF', 'VG'] },
    { name: 'Mac & Cheese', desc: 'Four cheese blend', badges: ['V'] },
  ],
  salads: [
    { name: 'Classic Caesar', desc: 'Romaine, parmesan, croutons', badges: [] },
    { name: 'Mixed Greens', desc: 'Balsamic vinaigrette', badges: ['GF', 'VG'] },
    { name: 'Wedge Salad', desc: 'Blue cheese, bacon', badges: ['GF'] },
    { name: 'Spinach & Strawberry', desc: 'Goat cheese, candied pecans', badges: ['GF', 'V'] },
  ],
}

export default function LunchPage() {
  const [attendees, setAttendees] = useState<Attendee[]>(INITIAL_ATTENDEES)
  const totalAttendees = 12
  const filledCount = attendees.filter(a => a.filled).length
  const pricePerPerson = 29.95
  const lunchTotal = filledCount * pricePerPerson

  const updateAttendee = (id: number, field: 'name' | 'email', value: string) => {
    setAttendees(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, [field]: value }
        updated.filled = updated.name.trim() !== '' && updated.email.trim() !== ''
        return updated
      }
      return a
    }))
  }

  return (
    <>
      <WizardProgress currentStep={3} />
      
      <main className={styles.content}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Lunch Selections</h1>
            <p>Add attendee details to send personalized menu selection links.</p>
          </div>

          {/* Info Banner */}
          <div className={styles.infoBanner}>
            <div className={styles.bannerIcon}>✉️</div>
            <div className={styles.bannerContent}>
              <h3>Personalized Selection Links</h3>
              <p>Each attendee will receive an email with a link to choose their lunch preferences. You&apos;ll be able to track responses in real-time.</p>
            </div>
            <button className={styles.bannerBtn}>How It Works</button>
          </div>

          {/* Attendee List */}
          <section className={styles.attendeeSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                Attendee List
                <span className={styles.badge}>{totalAttendees} attendees</span>
              </h2>
              <button className={`btn btn-outline ${styles.addBtn}`}>+ Add Attendee</button>
            </div>

            <div className={styles.attendeeList}>
              {attendees.map((attendee, index) => (
                <div key={attendee.id} className={`${styles.attendeeRow} ${attendee.filled ? styles.filled : ''}`}>
                  <div className={styles.attendeeNumber}>
                    {attendee.filled ? (
                      <span className={styles.checkIcon}>✓</span>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <input
                    type="text"
                    className={`form-input ${styles.nameInput}`}
                    placeholder="Full name"
                    value={attendee.name}
                    onChange={(e) => updateAttendee(attendee.id, 'name', e.target.value)}
                  />
                  <input
                    type="email"
                    className={`form-input ${styles.emailInput}`}
                    placeholder="Email address"
                    value={attendee.email}
                    onChange={(e) => updateAttendee(attendee.id, 'email', e.target.value)}
                  />
                  <button className={styles.deleteBtn}>×</button>
                </div>
              ))}
            </div>
          </section>

          {/* Menu Preview */}
          <section className={styles.menuSection}>
            <h2 className={styles.sectionTitle}>Lunch Menu Preview</h2>
            <p className={styles.menuSubtitle}>These are the options attendees will choose from:</p>

            <div className={styles.menuGrid}>
              <div className={styles.menuCategory}>
                <h3 className={styles.categoryTitle}>Entrées</h3>
                <div className={styles.menuItems}>
                  {MENU_ITEMS.entrees.map((item, i) => (
                    <div key={i} className={styles.menuItem}>
                      <div className={styles.menuItemName}>{item.name}</div>
                      <div className={styles.menuItemDesc}>{item.desc}</div>
                      {item.badges.length > 0 && (
                        <div className={styles.menuItemBadges}>
                          {item.badges.map((b, j) => (
                            <span key={j} className="dietary-badge">{b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.menuCategory}>
                <h3 className={styles.categoryTitle}>Sides</h3>
                <div className={styles.menuItems}>
                  {MENU_ITEMS.sides.map((item, i) => (
                    <div key={i} className={styles.menuItem}>
                      <div className={styles.menuItemName}>{item.name}</div>
                      <div className={styles.menuItemDesc}>{item.desc}</div>
                      {item.badges.length > 0 && (
                        <div className={styles.menuItemBadges}>
                          {item.badges.map((b, j) => (
                            <span key={j} className="dietary-badge">{b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.menuCategory}>
                <h3 className={styles.categoryTitle}>Salads</h3>
                <div className={styles.menuItems}>
                  {MENU_ITEMS.salads.map((item, i) => (
                    <div key={i} className={styles.menuItem}>
                      <div className={styles.menuItemName}>{item.name}</div>
                      <div className={styles.menuItemDesc}>{item.desc}</div>
                      {item.badges.length > 0 && (
                        <div className={styles.menuItemBadges}>
                          {item.badges.map((b, j) => (
                            <span key={j} className="dietary-badge">{b}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.pricingInfo}>
              <span className={styles.pricingLabel}>Lunch Package</span>
              <span className={styles.pricingValue}>${pricePerPerson.toFixed(2)} per person</span>
              <span className={styles.pricingNote}>Includes one entrée, one side, and one salad</span>
            </div>
          </section>
        </div>
      </main>

      <WizardFooter 
        currentStep={3}
        summaryItems={[
          { label: 'Attendees', value: `${filledCount} / ${totalAttendees}` },
          { label: 'Lunch Total', value: `$${lunchTotal.toFixed(2)}` },
        ]}
      />
    </>
  )
}
