import { WizardHeader } from '@/components/wizard'
import styles from './layout.module.css'

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.wizardLayout}>
      <WizardHeader />
      {children}
    </div>
  )
}
