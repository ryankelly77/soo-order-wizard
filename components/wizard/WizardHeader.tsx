'use client'

import Link from 'next/link'
import styles from './WizardHeader.module.css'

export default function WizardHeader() {
  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          <Link href="/" className={styles.logo}>
            <em>Sense</em> of <span>Occasion</span>
          </Link>
          <div className={styles.actions}>
            <button className={styles.headerBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
              </svg>
              Save Draft
            </button>
            <button className={styles.headerBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
              Exit
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
