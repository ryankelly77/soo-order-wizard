'use client'

import { useState } from 'react'
import { WizardProgress, WizardFooter } from '@/components/wizard'
import styles from './page.module.css'

export default function EventDetailsPage() {
  const [attendees, setAttendees] = useState(12)

  return (
    <>
      <WizardProgress currentStep={1} />
      
      <main className={styles.content}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Event Details</h1>
            <p>Tell us about your upcoming event so we can create the perfect catering experience.</p>
          </div>

          <div className={styles.formCard}>
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Basic Information</h3>
              
              <div className={styles.formGroup}>
                <label className="form-label">
                  Event Name <span className="required">*</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Q1 Strategy Meeting"
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className="form-label">
                    Event Date <span className="required">*</span>
                  </label>
                  <input 
                    type="date" 
                    className="form-input"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className="form-label">
                    Start Time <span className="required">*</span>
                  </label>
                  <input 
                    type="time" 
                    className="form-input"
                    defaultValue="09:00"
                  />
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Attendees</h3>
              
              <div className={styles.formGroup}>
                <label className="form-label">
                  Number of Attendees <span className="required">*</span>
                </label>
                <div className={styles.numberInput}>
                  <button 
                    className={styles.numberBtn}
                    onClick={() => setAttendees(Math.max(1, attendees - 1))}
                  >
                    −
                  </button>
                  <input 
                    type="number" 
                    className={styles.numberField}
                    value={attendees}
                    onChange={(e) => setAttendees(parseInt(e.target.value) || 1)}
                    min={1}
                  />
                  <button 
                    className={styles.numberBtn}
                    onClick={() => setAttendees(attendees + 1)}
                  >
                    +
                  </button>
                </div>
                <p className={styles.hint}>Minimum 1 attendee. You can adjust this later.</p>
              </div>

              <div className={styles.formGroup}>
                <label className="form-label">Event Type</label>
                <select className="form-input form-select">
                  <option value="">Select event type...</option>
                  <option value="board-meeting">Board Meeting</option>
                  <option value="client-presentation">Client Presentation</option>
                  <option value="team-lunch">Team Lunch</option>
                  <option value="training-session">Training Session</option>
                  <option value="celebration">Celebration / Milestone</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>Additional Information</h3>
              
              <div className={styles.formGroup}>
                <label className="form-label">Special Requirements or Notes</label>
                <textarea 
                  className="form-input"
                  rows={4}
                  placeholder="Any dietary restrictions, room setup preferences, or special requests..."
                />
              </div>
            </div>

            <div className={styles.infoCallout}>
              <div className={styles.calloutIcon}>✉️</div>
              <div className={styles.calloutContent}>
                <h4>Personalized Lunch Selections</h4>
                <p>In the next steps, you&apos;ll be able to send individual links to each attendee so they can select their own lunch preferences. This ensures everyone gets exactly what they want!</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WizardFooter 
        currentStep={1}
        summaryItems={[
          { label: 'Step', value: '1 of 6' },
        ]}
      />
    </>
  )
}
