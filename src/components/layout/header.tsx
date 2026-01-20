'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' as const },
  { name: 'New Order', href: '/new-order' as const },
  { name: 'Orders', href: '/orders' as const },
];

// Standard header for dashboard/non-wizard pages
export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center space-x-2">
          <span className="font-heading text-xl font-bold">SOO Catering</span>
        </Link>

        {isAuthenticated && (
          <nav className="hidden md:flex md:gap-6">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === item.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:block">
                {user?.firstName} {user?.lastName}
              </span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// Wizard header for order creation flow
interface WizardHeaderProps {
  onSaveDraft?: () => void;
  onExit?: () => void;
  showActions?: boolean;
}

export function WizardHeader({
  onSaveDraft,
  onExit,
  showActions = true,
}: WizardHeaderProps) {
  return (
    <header className="wizard-header">
      <div className="container">
        <Link href="/dashboard" className="logo">
          <em>Sense</em> of <span>Occasion</span>
        </Link>

        {showActions && (
          <div className="header-actions">
            {onSaveDraft && (
              <button className="btn-header" onClick={onSaveDraft}>
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                Save Draft
              </button>
            )}
            {onExit && (
              <button className="btn-header" onClick={onExit}>
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Exit
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
