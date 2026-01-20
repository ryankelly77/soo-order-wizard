'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import styles from './WizardFooter.module.css'

interface SummaryItem {
  label: string
  value: string
}

interface WizardFooterProps {
  currentStep: number
  prevHref?: string
  nextHref?: string
  nextLabel?: string
  summaryItems?: SummaryItem[]
  onNext?: () => void
  nextDisabled?: boolean
}

const STEP_PATHS = [
  '/order/event-details',
  '/order/breakfast',
  '/order/lunch',
  '/order/snacks',
  '/order/delivery',
  '/order/payment',
]

export default function WizardFooter({
  currentStep,
  prevHref,
  nextHref,
  nextLabel = 'Continue',
  summaryItems = [],
  onNext,
  nextDisabled = false,
}: WizardFooterProps) {
  const router = useRouter()
  
  const defaultPrevHref = currentStep > 1 ? STEP_PATHS[currentStep - 2] : undefined
  const defaultNextHref = currentStep < 6 ? STEP_PATHS[currentStep] : undefined
  
  const actualPrevHref = prevHref ?? defaultPrevHref
  const actualNextHref = nextHref ?? defaultNextHref
  
  const handleNext = () => {
    if (onNext) {
      onNext()
    } else if (actualNextHref) {
      router.push(actualNextHref)
    }
  }

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          {actualPrevHref ? (
            <Link href={actualPrevHref} className={`btn btn-ghost ${styles.prevBtn}`}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Previous
            </Link>
          ) : (
            <button className={`btn btn-ghost ${styles.prevBtn}`} disabled>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Previous
            </button>
          )}

          <div className={styles.summary}>
            {summaryItems.map((item, index) => (
              <div key={index} className={styles.summaryItem}>
                <div className={styles.summaryLabel}>{item.label}</div>
                <div className={styles.summaryValue}>{item.value}</div>
              </div>
            ))}
          </div>

          <button 
            className={`btn btn-primary ${styles.nextBtn}`}
            onClick={handleNext}
            disabled={nextDisabled}
          >
            {nextLabel}
            {currentStep < 6 && (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </footer>
  )
}
