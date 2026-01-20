'use client'

import styles from './WizardProgress.module.css'

const STEPS = [
  { id: 1, label: 'Event Details', path: '/order/event-details' },
  { id: 2, label: 'Breakfast', path: '/order/breakfast' },
  { id: 3, label: 'Lunch', path: '/order/lunch' },
  { id: 4, label: 'Snacks & Drinks', path: '/order/snacks' },
  { id: 5, label: 'Delivery', path: '/order/delivery' },
  { id: 6, label: 'Payment', path: '/order/payment' },
]

interface WizardProgressProps {
  currentStep: number
}

export default function WizardProgress({ currentStep }: WizardProgressProps) {
  return (
    <div className={styles.progress}>
      <div className="container">
        <div className={styles.indicator}>
          {STEPS.map((step) => {
            const isComplete = step.id < currentStep
            const isActive = step.id === currentStep
            
            return (
              <div 
                key={step.id} 
                className={`${styles.step} ${isComplete ? styles.complete : ''} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.circle}>
                  {isComplete ? '✓' : step.id}
                </div>
                <span className={styles.label}>{step.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
